let Slider = {
  create: (min, max, changeCallback) => {
    let el = Dom.create("input", {
      "type": "range",
      "min": min,
      "max": max,
      "step": "1"
    });
    el.classList.add("gccfx-video-size-slider");
    el.addEventListener("change", changeCallback);

    return el;
  },

  getNode: (gif) => {
    return ImageViewer.getImageViewerNode(gif).querySelector(".gccfx-video-size-slider");
  }

};
