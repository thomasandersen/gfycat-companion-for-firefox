/**
 * resImageViewerMod
 * 
 * This script runs only when the RES add-on is installed (see lib/main.js).
 * Sets up listeners for when the image viewer is expaned or collapsed
 * Tries to replace the image viewer's gif with a gfycat video.
 */

let gifmap = new Map();

let gifKey = -1;

let videoLoaded = false;

let isResImageViewerSupportDisabled = false;

self.port.on("resImageViewerSupportDisabled", () => {
  isResImageViewerSupportDisabled = true;
});

self.port.on("transcodeStart", (gifUrl, gifKey) => {
  StatusBar.showLoading(gifmap.get(gifKey));
});

self.port.on("transcodeSuccess", (transcodeJson, gifKey, loadingMessage) => {
  replaceGifWithVideo(transcodeJson, gifKey, loadingMessage);
});

self.port.on("transcodeError", (gifKey, errorMessage, showErrorMessage) => {
  onTranscodeError(gifKey, errorMessage, showErrorMessage);
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
    if (collapse) {
      onImageViewerExpand(imageViewerNode);
    } else {
      onImageViewerCollapse(imageViewerNode);
    }
  }
});

function onImageViewerExpand(imageViewerNode) {
  if (isResImageViewerSupportDisabled) {
    return;
  }

  let gif = imageViewerNode.querySelector(".RESImage");
  let anchor = ImageViewer.getGifAnchorNode(gif);

  anchor.style.display = "none";

  let resGalleryControls = ImageViewer.getResGalleryControlsNode(gif);
  if (resGalleryControls) {
    initGalleryBrowse(resGalleryControls);
  }
  // Temporary fix for galleries. 
  // Without this the gallery collapses each time a new image is loaded.
  anchor.style.overflow = "auto";

  tryFetchVideo(gif, null);
}

function onImageViewerCollapse(imageViewerNode) {
  let gif = imageViewerNode.querySelector(".RESImage");
  if (gif) {
    cleanUp(gif);
  }
}

function tryFetchVideo(gif) {
  // Store reference to the gif  as the workers do not accept dom nodes.
  gifKey++;
  gifmap.set(gifKey, gif);
  
  addStatusBar(gif);

  // Tell the add-on to fetch the info.
  self.port.emit("requestGfyTranscoder", gif.src, gifKey);
}

function onTranscodeError(gifKey, errorMessage, showErrorMessage) {
  let gif = gifmap.get(gifKey);

  console.error(errorMessage);

  cleanUp(gif);

  // Make sure that the gif is requested. 
  // The res image blocker will not block urls with gccfxDoRequest parameter
  let src = gif.getAttribute("src");
  let newSrc = !src.contains("?") ? src + "?" : src + "&";
  newSrc += "gccfxDoRequest=1";
  gif.setAttribute("src", newSrc);

  if (showErrorMessage) {
    let messageNode = Message.getNode(gif);
    if (messageNode) {
      Dom.removeNode(messageNode);
    }
    messageNode = Message.create(errorMessage);
    let anchor = ImageViewer.getGifAnchorNode(gif);
    anchor.parentNode.insertBefore(messageNode, anchor);
  }
  
  gifmap.delete(gifKey);
}

function onVideoInput(event) {
  let resizer = event.target;
  let video = resizer.nextSibling;
  video.setAttribute("width", resizer.value);
}

function replaceGifWithVideo(transcodeJson, gifKey, loadingMessage) {
  let gif = gifmap.get(gifKey);
  let imageViewerNode = ImageViewer.getImageViewerNode(gif);
  let anchor = ImageViewer.getGifAnchorNode(gif);

  let video = imageViewerNode.querySelector("video");

  // Hide image.
  ImageViewer.getGifAnchorNode(gif).style.display = "none";

  if (video) {
    Dom.removeNode(video);
  }

  video = Video.create(transcodeJson.webmUrl, transcodeJson.gifWidth, () => {
    videoLoaded = true;

    // Display loading message.
    let statusBar = StatusBar.getNode(gif);
    if (statusBar) {
      Dom.removeNode(statusBar);
    }

    // Add message
    let messageNode = Message.getNode(gif);
    if (messageNode) {
      Dom.removeNode(messageNode);
    }

    let message = loadingMessage + " <a href=\""+ anchor.getAttribute("href") +"\">Open in video viewer</a>";
    messageNode = Message.create(message);
    video.parentNode.insertBefore(messageNode, video);
    
    // Make sure the gallery controls are enabled.
    let shim = ImageViewer.getResGalleryControlsNodeShimNode(gif);
    if (shim) {
      shim.style.pointerEvents = "none";
    }

    let videoResizer = Slider.getNode(gif);
    if (videoResizer) {
      Dom.removeNode(videoResizer);
    }

    videoResizer = Slider.create((transcodeJson.gifWidth / 2), (transcodeJson.gifWidth * 2), onVideoInput, function(event) {
      event.preventDefault();
      var up = event.detail < 0;
      var currentValue = parseInt(videoResizer.value, 10);
      var step = 20;
      videoResizer.value = (up ? currentValue + step : currentValue - step);
      
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("input", false, true);
      videoResizer.dispatchEvent(evt);

    });
    video.parentNode.insertBefore(videoResizer, video);
    videoResizer.setAttribute("value", transcodeJson.gifWidth);

    gifmap.delete(gifKey);

    console.log("Converted: " + gif.getAttribute("src"));
    console.log("shim", shim);
    console.log("---------------------------------------------");
  });

  imageViewerNode.appendChild(video);
}

function addStatusBar(gif) {
  let bar = StatusBar.getNode(gif);
  if (bar) {
    Dom.removeNode(bar);
  }
  bar = StatusBar.create();
  
  let anchor = ImageViewer.getGifAnchorNode(gif);
  anchor.parentNode.insertBefore(bar, anchor);
}

function initGalleryBrowse(resGalleryControls) {
  if (resGalleryControls && !resGalleryControls.classList.contains("videoClick")) {
    resGalleryControls.style.position = "relative";
    resGalleryControls.classList.add("videoClick");

    let shim = ImageViewer.createShimForControls(resGalleryControls);
    resGalleryControls.appendChild(shim);

    let nextButton = resGalleryControls.querySelector(".next");
    let prevButton = resGalleryControls.querySelector(".previous");

    let browse = function() {
      let gif = resGalleryControls.nextSibling.querySelector(".RESImage");

      let height = gif.style.maxHeight ? gif.style.maxHeight : 200;
      gif.style.height = height;
      gif.addEventListener("load", gifLoaded);

      videoLoaded = false;
      shim.style.pointerEvents = "none";

      tryFetchVideo(gif);
    };
    nextButton.addEventListener("click", browse);
    prevButton.addEventListener("click", browse);
  }
}

function gifLoaded(event) {
  let gif = event.target;
  gif.style.height = "";
  gif.removeEventListener("load", gifLoaded);
}

function cleanUp(gif) {
  let video = Video.getNode(gif);
  if (video) {
    Dom.removeNode(video);
  }

  let resizeSlider = Slider.getNode(gif);
  if (resizeSlider) {
    resizeSlider.removeEventListener("input", onVideoInput);
    // Fixme: remove mousewheel event.
    Dom.removeNode(resizeSlider);
  }

  let shim = ImageViewer.getResGalleryControlsNodeShimNode(gif);
  if (shim) {
    shim.style.pointerEvents = "none";
  }

  let anchor = ImageViewer.getGifAnchorNode(gif);
  if (anchor) {
    anchor.style.display = "";
  }

  gif.nextSibling.style.width = gif.width + "px";
  gif.nextSibling.style.height = gif.height + "px";

  let statusBar = StatusBar.getNode(gif);
  if (statusBar) {
    Dom.removeNode(statusBar);
  }

  let messageNode = Message.getNode(gif);
  if (messageNode) {
    Dom.removeNode(messageNode);
  }

  gif.removeEventListener("load", gifLoaded);
}

