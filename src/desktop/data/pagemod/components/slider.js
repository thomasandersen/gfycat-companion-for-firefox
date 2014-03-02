let Slider = {
  create: (min, max, inputCallback, scrollCallback) => {
    let el = Dom.create("input", {
      "type": "range",
      "min": min,
      "max": max,
      "step": "1"
    });
    el.classList.add("gccfx-video-size-slider");
    el.addEventListener("input", inputCallback);
    el.addEventListener("DOMMouseScroll", scrollCallback);

    return el;
  },

  getNode: (gif) => {
    return ImageViewer.getImageViewerNode(gif).querySelector(".gccfx-video-size-slider");
  }

};
