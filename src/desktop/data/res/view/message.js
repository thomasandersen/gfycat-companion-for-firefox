let Message = {
  create: (message) => {
    let node = Dom.create("div");
    node.classList.add("gccfx-message");
    node.textContent = message;
    
    return node;
  },

  getNode: (gif) => {
    return ImageViewer.getImageViewerNode(gif).querySelector(".gccfx-message");
  }

};