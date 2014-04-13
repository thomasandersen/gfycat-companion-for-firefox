let gIsResImageViewerSupportDisabled = false;

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
        PageMod.onExpandImageViewer(imageViewerNode);
      }
    }
  }
});
