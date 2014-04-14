let Companion = {
  createVideoElem: (aSrc, aWidth, aLoadedDataCallback) => {
    let video = Dom.create("video", {
      "loop": "true",
      "autoplay": "true",
      "controls": "true",
      "width": aWidth,
      "style": "display: block",
      "class": "gccfx-video",
    });

    let source = Dom.create("source", {
      "type": "video/webm",
      "src": aSrc
    });

    video.appendChild(source);
    video.addEventListener("loadeddata", aLoadedDataCallback);

    return video;
  },

  getVideoElem: (aImage) => {
    return RES.getImageContainerElem(aImage).querySelector(".gccfx-video");
  },

  createMessageElem: (aMessageHtml) => {
    let elem = Dom.create("div");
    elem.classList.add("gccfx-message");
    elem.innerHTML = aMessageHtml;

    return elem;
  },

  getMessageElem: (aImage) => {
    return RES.getImageContainerElem(aImage).querySelector(".gccfx-message");
  },

  createResizeSliderElem: (aMinValue, aMaxValue, aInputCallback) => {
    let elem = Dom.create("input", {
      "type": "range",
      "min": aMinValue,
      "max": aMaxValue,
      "step": "1"
    });
    elem.classList.add("gccfx-video-size-slider");
    elem.addEventListener("input", aInputCallback);

    return elem;
  },

  getResizeSliderElem: (aImage) => {
    return RES.getImageContainerElem(aImage).querySelector(".gccfx-video-size-slider");
  },

  createStatusBarElem: () => {
    let elem = Dom.create("div", {
      "class": "gccfx-status-bar",
    });
    elem.textContent = "Checking image";

    return elem;
  },

  getStatusBarElem: (aImage) => {
    return RES.getImageContainerElem(aImage).querySelector(".gccfx-status-bar");
  },

  showLoadingBar: (aImage) => {
    let statusbarElem = RES.getImageContainerElem(aImage).querySelector(".gccfx-status-bar");
    statusbarElem.textContent = "transcoding in progress...";
    statusbarElem.classList.add("gccfx-loader-bar-background");
    statusbarElem.classList.add("gccfx-loader-animation");
  }
};