/**
 * resPageMod
 * 
 * This script runs only when the RES add-on is installed (see lib/main.js).
 * Sets up listeners for expanding and collapsing of the RES's image viewer 
 * and tries to replace the image viewer's gif with a gfycat video.
 *
 * Todo: Research support multiple images in image viewer.
 *       Test page: http://www.reddit.com/r/gifs/comments/1ty6ft/stereographic_3d_drawings/
 *
 */
let elementsKey = -1;
let elements = new Map();

function createLoadingInfoElement() {
  let loadingInfo = document.createElement("div");
  loadingInfo.setAttribute("style", "font-size: 15px; padding: 10px")
  loadingInfo.textContent = "Converting gif to gfycat video";
  return loadingInfo;
}

function findImageViewerElement(toggleButton) {
  let currentNode = toggleButton;
  let imageViewer = null; 
  while (!currentNode.classList.contains("madeVisible")) {
    currentNode = currentNode.nextSibling;
    imageViewer = currentNode;
  }
  return imageViewer;
}

function replaceGifWithVideo(gfyInfo, elementsKey) {
  let gif = elements.get(elementsKey).gif;
  let loadingInfo = elements.get(elementsKey).loadingInfo;

  let video = document.createElement("video");
  video.setAttribute("loop", "true");
  video.setAttribute("controls", "true");
  video.setAttribute("style", "display: block");
  video.setAttribute("class", "gccfx-video RESImage");

  video.addEventListener("loadeddata", () => {
    loadingInfo.parentNode.removeChild(loadingInfo);
    elements.delete(elementsKey);
  });

  let source = document.createElement("source");
  source.setAttribute("type", "video/webm");
  source.setAttribute("src", gfyInfo.webmUrl);
  video.appendChild(source);

  let anchor = gif.parentNode;
  anchor.parentNode.insertBefore(video, anchor);

  video.play();
}

function expandImageViewerListener(imageViewer) {
  let image = imageViewer.querySelector(".RESImage");
  if (!image || !image.src.endsWith(".gif")) {
    return;
  }

  let gif = image;
  let loadingInfo = createLoadingInfoElement();
  let anchor = gif.parentNode;
  anchor.parentNode.insertBefore(loadingInfo, anchor);
  anchor.style.display = "none";

  // Let the add-on request the transcoder service
  // as page mod scripts can not make cross domain requests.
  // Since communication between the page mod and add-on uses web workers 
  // which does not have access to the DOM we'll store the nodes in elements
  // for later use.
  elementsKey++;
  elements.set(elementsKey, {
    gif: gif,
    loadingInfo: loadingInfo
  });
  self.port.emit("fetchGfyInfo", encodeURIComponent(gif.src), elementsKey);
}

function collapseImageViewerListener(imageViewer) {
  let video = imageViewer.querySelector(".gccfx-video");
  if (!video) {
    return;
  }
  video.parentNode.removeChild(video);
  let gif = imageViewer.querySelector(".RESImage");
  gif.parentNode.style.display = "";
}

self.port.on("gfyInfoFetched", (gfyInfo, elementsKey) => {
  replaceGifWithVideo(gfyInfo, elementsKey);
});

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
    expandImageViewerListener(imageViewerElement);
  } else {
    collapseImageViewerListener(imageViewerElement);
  }
});

