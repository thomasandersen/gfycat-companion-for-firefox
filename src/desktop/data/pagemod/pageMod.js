let gIsResImageViewerSupportDisabled = false;

let ImageElements = {
  counter: 0,
  map: new Map(),

  add: function(aImg) {
    let key = this.counter++;
    this.map.set(key, aImg);
    return key;
  },

  getByKey: function(aKey) {
    return this.map.get(aKey);
  },

  deleteByKey: function(aKey) {
    this.map.delete(aKey);
  }
};

self.port.on("transcodeRequestStart", (aImageUrl, aImageKey) => {
  Companion.showLoadingBar(ImageElements.getByKey(aImageKey));
});

self.port.on("transcodeRequestSuccess", (aTranscodeJson, aImageKey, aMessage) => {
  PageMod.replaceImageWithVideo(aTranscodeJson, aImageKey, aMessage);
});

self.port.on("transcodeRequestError", (aImageKey, aErrorMessage, aShowErrorMessage) => {
  PageMod.onTranscodeError(aImageKey, aErrorMessage, aShowErrorMessage);
});

self.port.on("resImageViewerSupportDisabled", () => {
  gIsResImageViewerSupportDisabled = true;
});

document.addEventListener("click", (event) => {
  let target = event.target;
  if (target.classList.contains("toggleImage")) {
    let currentNode = target;
    let imageViewerNode = null;
    while (!currentNode.classList.contains("madeVisible")) {
      currentNode = currentNode.nextSibling;
      imageViewerNode = currentNode;
    }
    if (!imageViewerNode) {
      return;
    }

    let collapse = target.classList.contains("expanded");
    let loaded = imageViewerNode.classList.contains("gccfx-loaded");
    if (collapse) {
      if (!loaded) {
        let image = imageViewerNode.querySelector(".RESImage");
        PageMod.onExpandImageViewer(image);
      }
    }
  }
});

let PageMod = {
  /**
   * Called when the image viewer expando button is called.
   *
   * @param element aImage
   *        The image that we will try to convert to video.
   */
  onExpandImageViewer: function(aImage) {
    if (gIsResImageViewerSupportDisabled) {
      return;
    }
    let viewer = RES.getViewer(aImage);

    let anchor = viewer.container.anchor.element;
    anchor.style.display = "none";

    let galleryControls = viewer.container.gallerycontrols;

    if (galleryControls.element) {
      this.initGalleryBrowse(galleryControls);
      // Temporary fix for galleries. Without this the gallery collapses
      // each time a new image is loaded.
      anchor.style.overflow = "auto";
    }

    this.onRequestTranscoderService(aImage, null);
    // Mark the container as loaded.
    RES.getViewer(aImage).container.element.classList.add("gccfx-loaded");
  },

  /**
   * Emits event to the add-on which requests the GfyCat transcoder service.
   *
   * @param element aImg
   *        The gif we are trying to convert into a video.
   */
  onRequestTranscoderService: function(aImage) {
    this.addStatusBar(aImage);
    let key = ImageElements.add(aImage);
    self.port.emit("requestTranscoder", aImage.src, key);
  },

  /**
   * Adds status bar before the image.
   *
   * @param element aImg
   *        The image we are trying to convert into a video.
   */
  addStatusBar: function(aImg) {
    let bar = Companion.getStatusBarElem(aImg);
    if (bar) {
      Dom.removeElem(bar);
    }
    bar = Companion.createStatusBarElem();
    let anchor = RES.getViewer(aImg).container.anchor.element;
    Dom.insertBefore(bar, anchor);
  },

  /**
   * Called when the add-on receives an error response from the GfyCat
   * transcoder service.
   *
   * @param number aImageKey
   *        Reference to the gif in the ImageElements map.
   * @param string aErrorMessage
   *        The error message to show.
   * @param boolean aShowErrorMessage
   *        Wether if the the error message should be shown.
   */
  onTranscodeError: function(aImageKey, aErrorMessage, aShowErrorMessage) {
    let image = ImageElements.getByKey(aImageKey);

    this.cleanUp(image);

    // Make sure that the gif is requested.
    // Set the source twice in order to properly load the image from the server.
    let src = image.getAttribute("src");
    let newSrc = !src.contains("?") ? src + "?" : src + "&";
    newSrc += "gccfxDoRequest=1";
    image.setAttribute("src", newSrc);
    image.setAttribute("src", src);

    // The image request blocker has been disabled in order to load the image.
    // Enable it again
    self.port.emit("enableImageRequestBlocker");

    if (aShowErrorMessage) {
      let messageNode = Companion.getMessageElem(image);
      if (messageNode) {
        Dom.removeElem(messageNode);
      }
      messageNode = Companion.createMessageElem(aErrorMessage);
      let anchor = RES.getViewer(image).container.anchor.element;
      anchor.parentNode.insertBefore(messageNode, anchor);
    }
    ImageElements.deleteByKey(aImageKey);
  },

  /**
   * Replaces the image with a video element.
   *
   * @param object aTranscodeJson
   *               GfyCat json response.
   * @param number aImageKey
   *               The reference to the image element in the ImageElements map.
   * @param string aMessage
   *               The message to display next to the video.
   */
  replaceImageWithVideo: function(aTranscodeJson, aImageKey, aMessage) {
    let viewer = RES.getViewer(ImageElements.getByKey(aImageKey));
    let imageContainer = viewer.container.element;
    let anchor = viewer.container.anchor.element;
    let image = viewer.container.anchor.image.element;

    // Hide image.
    anchor.style.display = "none";

    let video = imageContainer.querySelector("video");
    if (video) {
      Dom.removeElem(video);
    }

    let onVideoDataLoaded = () => {
      // Display loading message.
      let statusBar = Companion.getStatusBarElem(image);
      if (statusBar) {
        Dom.removeElem(statusBar);
      }

      // Add message
      let messageNode = Companion.getMessageElem(image);
      if (messageNode) {
        Dom.removeElem(messageNode);
      }

      let message = aMessage + " <a class=\"gccfx-open-in-viewer\" href=\""+ anchor.getAttribute("href") +"\" target=\"_blank\">Open in video viewer</a>";
      messageNode = Companion.createMessageElem(message);
      video.parentNode.insertBefore(messageNode, video);

      let videoResizer = Companion.getResizeSliderElem(image);
      if (videoResizer) {
        Dom.removeElem(videoResizer);
      }

      let resizerMinValue = aTranscodeJson.gifWidth / 2;
      let resizerMaxValue = aTranscodeJson.gifWidth * 2;

      videoResizer = Companion.createResizeSliderElem(resizerMinValue, resizerMaxValue, PageMod.onResizerInput);
      videoResizer.addEventListener("DOMMouseScroll", function(event) {
        PageMod.onMouseScroll(event, videoResizer);
      });

      video.addEventListener("DOMMouseScroll", function(event) {
        PageMod.onMouseScroll(event, videoResizer);
      });

      video.parentNode.insertBefore(videoResizer, video);
      videoResizer.setAttribute("value", aTranscodeJson.gifWidth);

      ImageElements.deleteByKey(aImageKey);

      console.log("Converted: " + image.getAttribute("src"));
      console.log("---------------------------------------------");
    };

    video = Companion.createVideoElem(aTranscodeJson.webmUrl, aTranscodeJson.gifWidth, onVideoDataLoaded);

    imageContainer.appendChild(video);
  },

  /**
   * Called when the image resizer changes
   *
   * @param object aEvent
   *        The input event object.
   */
  onResizerInput: function(aEvent) {
    let resizerElem = aEvent.target;
    let videoElem = resizerElem.nextSibling;
    videoElem.setAttribute("width", resizerElem.value);
  },

  /**
   * Called when the mouse scroll wheel is used.
   *
   * @param object aEvent
   *        The event object.
   * @param element aVideoResizer
   *        The video resizer element.
   */
  onMouseScroll: function(aEvent, aVideoResizer) {
    aEvent.preventDefault();
    var up = aEvent.detail < 0;
    var currentValue = parseInt(aVideoResizer.value, 10);
    var step = 20;
    aVideoResizer.value = (up ? currentValue + step : currentValue - step);

    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("input", false, true);
    aVideoResizer.dispatchEvent(evt);
  },

  /**
   * Adds listeners to the back/forward buttons for galleries.
   *
   * @param object aGalleryControls
   *        The gallery controls in the RES markup structure.
   */
  initGalleryBrowse: function(aGalleryControls) {
    let resGalleryControls = aGalleryControls.element;
    if (resGalleryControls && !resGalleryControls.classList.contains("videoClick")) {
      resGalleryControls.style.position = "relative";
      resGalleryControls.classList.add("videoClick");

      let nextButton = resGalleryControls.querySelector(".next");
      let prevButton = resGalleryControls.querySelector(".previous");

      let browse = function() {
        let image = resGalleryControls.nextSibling.querySelector(".RESImage");
        let anchor = RES.getViewer(image).container.anchor.element;
        anchor.style.display = "none";
        let height = image.style.maxHeight ? image.style.maxHeight : 200;
        image.style.height = height;
        image.addEventListener("load", PageMod.onGalleryImageLoaded);

        PageMod.onRequestTranscoderService(image);
      };
      nextButton.addEventListener("click", browse);
      prevButton.addEventListener("click", browse);
    }
  },

  /**
   * Called when the image is loaded.
   *
   * @param object aEvent
   *        The input event object.
   */
  onGalleryImageLoaded: function(aEvent) {
    let image = aEvent.target;
    image.style.height = "";
    image.removeEventListener("load", PageMod.onGalleryImageLoaded);
  },

  /**
   * Restores the modiefied RES mark-up.
   *
   * @param element aImg
   *        The gif image element.
   */
  cleanUp: function(aImg) {
    let viewer = RES.getViewer(aImg);
    let video = Companion.getVideoElem(aImg);
    if (video) {
      Dom.removeElem(video);
    }

    let resizeSlider = Companion.getResizeSliderElem(aImg);
    if (resizeSlider) {
      resizeSlider.removeEventListener("input", PageMod.onResizerInput);
      // Fixme: remove mousewheel event.
      Dom.removeElem(resizeSlider);
    }

    let anchor = viewer.container.anchor.element;
    if (anchor) {
      anchor.style.display = "";
    }

    aImg.nextSibling.style.width = aImg.width + "px";
    aImg.nextSibling.style.height = aImg.height + "px";

    let statusBar = Companion.getStatusBarElem(aImg);
    if (statusBar) {
      Dom.removeElem(statusBar);
    }

    let messageNode = Companion.getMessageElem(aImg);
    if (messageNode) {
      Dom.removeElem(messageNode);
    }

    aImg.removeEventListener("load", PageMod.onGalleryImageLoaded);
  }

};