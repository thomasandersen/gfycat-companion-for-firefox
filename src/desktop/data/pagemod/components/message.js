let Message = {
  create: (messageHtml) => {
    let node = Dom.create("div");
    node.classList.add("gccfx-message");
    node.innerHTML = messageHtml;
    
    return node;
  },

  getNode: (gif) => {
    return ImageViewer.getImageViewerNode(gif).querySelector(".gccfx-message");
  }

};