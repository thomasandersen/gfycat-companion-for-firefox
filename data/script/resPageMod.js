// Todo: Research support multiple images in image viewer.
//       Test page: http://www.reddit.com/r/gifs/comments/1ty6ft/stereographic_3d_drawings/
// Todo: Research client side EXIF or contentType for gif detection instead of file extension.
//        Test page: http://www.reddit.com/r/gifs/comments/1u0f8b/slip_n_slide_parachute_ride/

function findImageViewerElement(toggleButton) {
  let currentNode = toggleButton;
  let imageViewerElement = null; 
  while (!currentNode.classList.contains("madeVisible")) {
    currentNode = currentNode.nextSibling;
    imageViewerElement = currentNode;
  }
  return imageViewerElement;
}

function handleImageViewerExpand(imageViewer) {
  let image = imageViewer.querySelector(".RESImage");
  if (!image || !image.src.endsWith(".gif")) {
    return;
  }
  let iframe = document.createElement("iframe");
  iframe.setAttribute("style", "width: 100%; height: 500px; border: none; display: block");
  iframe.setAttribute("src", "http://gfycat.com/fetch/" + image.src);
  iframe.setAttribute("class", "gccfx-iframe");
  image.parentNode.parentNode.insertBefore(iframe, image.parentNode);
  image.parentNode.style.display = "none";
}

function handleImageViewerCollapse(imageViewer) {
  let iframe = imageViewer.querySelector(".gccfx-iframe");
  if (!iframe) {
    return;
  }
  let image = imageViewer.querySelector(".RESImage");
  iframe.parentNode.removeChild(iframe);
  image.parentNode.style.display = "";
}

document.addEventListener("click", (event) => {
  let target = event.target;
  if (!target.classList.contains("toggleImage")) {
    return;
  }
  let imageViewerElement = findImageViewerElement(target);
  if (!imageViewerElement) {
    return;
  }
  let expand = target.classList.contains("expanded");
  if (expand) {
    handleImageViewerExpand(imageViewerElement);
  } else {
    handleImageViewerCollapse(imageViewerElement);
  }
});