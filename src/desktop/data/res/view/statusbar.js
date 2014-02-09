let StatusBar = {
  create: () => {
    let bar = Dom.create("div", {
      "class": "gccfx-status-bar",
    });
    bar.textContent = "Checking image";

    return bar;
  },

  showLoading: (gif) => {
    let statusbar = ImageViewer.getImageViewerNode(gif).querySelector(".gccfx-status-bar");
    statusbar.textContent = "gfycat is working";
    statusbar.classList.add("gccfx-loader-bar-background");
    statusbar.classList.add("gccfx-loader-animation");
  },

  getNode: (gif) => {
    return ImageViewer.getImageViewerNode(gif).querySelector(".gccfx-status-bar");
  }

};