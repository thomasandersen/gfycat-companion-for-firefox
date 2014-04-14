let RES = {

  getImageContainerElem: (gif) => {
    return gif.parentNode.parentNode.parentNode;
  },

  getImageAnchorElem: (gif) => {
    return gif.parentNode;
  },

  getGalleryControlsElem: (gif) => {
    try {
      return RES.getImageAnchorElem(gif).parentNode.parentNode.querySelector(".RESGalleryControls");
    } catch(ex) {
    }
    return null;
  },

  getResGalleryControlsNodeShimNode: (gif) => {
    let galleryControls = RES.getGalleryControlsElem(gif);
    try {
      return galleryControls.querySelector(".gccfx-gallery-controls-shim");
    } catch(ex) {
    }
    return null;
  },

  createShimForControls: (resGalleryControls) => {
    let width = resGalleryControls.offsetWidth;
    let height = resGalleryControls.offsetHeight;
    let shim = document.createElement("div");
    shim.classList.add("gccfx-gallery-controls-shim");
    shim.setAttribute("style", "width: " + width + "px; height:" + height + "px ");
    shim.style.pointerEvents = "none";
    return shim;
  }

};