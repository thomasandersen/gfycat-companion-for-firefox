let Video = {
  create: (src, width, loadedDataCallback) => {
    let video = Dom.create("video", {
      "loop": "true",
      "autoplay": "true",
      "controls": "true",
      "width": width,
      "style": "display: block",
      "class": "gccfx-video",
    });
    video.addEventListener("loadeddata", loadedDataCallback);

    let source = Dom.create("source", {
      "type": "video/webm",
      "src": src
    });

    video.appendChild(source);

    return video;
  },

  getNode: (gif) => {
    return ImageViewer.getImageViewerNode(gif).querySelector(".gccfx-video");
  }
};