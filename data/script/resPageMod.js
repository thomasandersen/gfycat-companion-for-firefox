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
 * Todo: Should display an error message when fetching gfy info fails.
 *
 */

let gifKey = -1;

let gifmap = new Map();

let gVideoLoaded = false;

let pageModWorkerDestroyed = false;

function getGifAnchorNode(gif) {
  return gif.parentNode;
}

function getLoadingInfoNode(gif) {
  return getGifAnchorNode(gif).parentNode.querySelector(".gccfx-loading-info");
}

function getResImagePlaceHolderNode(gif) {
  return gif.parentNode.querySelector(".RESImagePlaceholder");
}

function getVideoNode(gif) {
  return getGifAnchorNode(gif).parentNode.querySelector(".gccfx-video");
}

function getResGalleryControlsNode(gif) {
  try {
    return getGifAnchorNode(gif).parentNode.parentNode.querySelector(".RESGalleryControls");
  } catch(ex) {
  }
  return null;
}

function getResGalleryControlsNodeShimNode(gif) {
  let galleryControls = getResGalleryControlsNode(gif);
  try {
    return galleryControls.querySelector(".gccfx-gallery-controls-shim")
  } catch(ex) {
  }
  return null;
}

self.port.on("pageModDestroyed", () => {
  pageModWorkerDestroyed = true;
});

self.port.on("gfyInfoFetchSuccess", (gfyInfo, gifKey) => {
  replaceGifAndLoadVideo(gfyInfo, gifKey);
});

self.port.on("gfyInfoFetchError", (gfyInfo, gifKey) => {
  console.log("gfyinfo fetch failed");

  let gif = gifmap.get(gifKey);
  gif.setAttribute("src", gif.getAttribute("data-gccfxSrc"));

  let resImagePlaceholder = getResImagePlaceHolderNode(gif);
  if (resImagePlaceholder) {
    resImagePlaceholder.style.display = "";
  }

  let shim = getResGalleryControlsNodeShimNode(gif);
  if (shim) {
    shim.style.pointerEvents = "none";
  }

  let anchor = getGifAnchorNode(gif);
  if (anchor) {
    anchor.style.display = "";
  }

  let video = getVideoNode(gif);
  if (video) {
    video.parentNode.removeChild(video);
  }

  let loadingInfo = getLoadingInfoNode(gif);
  if (loadingInfo && loadingInfo.parentNode) {
    if (gfyInfo.error) {
      loadingInfo.textContent = gfyInfo.error;
      loadingInfo.style.transition = "all 1s";
      loadingInfo.style.background = "";

    } else {
      loadingInfo.parentNode.removeChild(loadingInfo);
    }
  }

  gifmap.delete(gifKey);
});

function getBandwidthSavedInMB(gfyInfo) {
  let gifSize = gfyInfo.gifSize;
  let gfySize = gfyInfo.gfysize;
  return ((gifSize - gfySize) / 1024) / 1024;
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

function fetchGfyInfo(gif, shim) {
  gif.setAttribute("data-gccfxSrc", gif.getAttribute("src"));
  gif.setAttribute("src", "");

  let anchor = gif.parentNode;
  anchor.style.display = "none";

  loadingInfo = getLoadingInfoNode(gif);
  if (loadingInfo) {
    loadingInfo.parentNode.removeChild(loadingInfo);
  }
  loadingInfo = createLoadingInfoElement();

  let resImagePlaceholder = gif.parentNode.querySelector(".RESImagePlaceholder");
  if (resImagePlaceholder) {
    resImagePlaceholder.style.display = "none";
  }

  if (anchor.parentNode.firstChild) {
    anchor.parentNode.insertBefore(loadingInfo, anchor.parentNode.firstChild); 
    // Start the loading animation. Seems like we need a timeout for the animation to start. 
    setTimeout(function() {
      loadingInfo.classList.add("gccfx-loader-animation");
      //loadingInfo.style.backgroundSize = "2000px 30px";
    }, 10);
  } 

  // Let the add-on request the transcoder service
  // as page mod scripts can not make cross domain requests.
  // Since communication between the page mod and add-on uses web workers 
  // which does not have access to the DOM we'll store the nodes in elements
  // for later use.
  gifKey++;
  gifmap.set(gifKey, gif);

  self.port.emit("fetchGfyInfo", encodeURIComponent(gif.getAttribute("data-gccfxSrc")), gifKey);
}

function replaceGifAndLoadVideo(gfyInfo, gifKey) {
  let gif = gifmap.get(gifKey);

  let video = getVideoNode(gif);
  if (video) {
    video.parentNode.removeChild(video);
  }
  video = document.createElement("video");
  video.setAttribute("loop", "true");
  video.setAttribute("controls", "true");
  video.setAttribute("width", gfyInfo.gifWidth);
  video.setAttribute("style", "display: block");
  video.setAttribute("class", "gccfx-video");
  video.addEventListener("loadeddata", () => {
    gVideoLoaded = true;

    let loadingInfo = getLoadingInfoNode(gif);
    let shim = getResGalleryControlsNodeShimNode(gif);
  
    console.log("Loaded: " + gif.getAttribute("data-gccfxSrc"));
    console.log("shim", shim);
    console.log("---------------------------------------------");
  
    if (loadingInfo && loadingInfo.parentNode) {
      // fixme: better math!
      let bytesSaved = getBandwidthSavedInMB(gfyInfo);
      let message = "About " + bytesSaved.toPrecision(2) + " MB of bandwidth was saved";

      if (String(bytesSaved).startsWith("-")) {
        message = "huh! the gfycat video (" + gfyInfo.gfysize + " Bytes) is actually larger than the gif (" + gfyInfo.gifSize + " Bytes)";
      }

      loadingInfo.textContent = message;
      // loadingInfo.style.transition = "all 3s";
      loadingInfo.style.backgroundImage = "none";
    }
    if (shim) {
      shim.style.pointerEvents = "none";
    }
    gifmap.delete(gifKey);
  });
  let source = document.createElement("source");
  source.setAttribute("type", "video/webm");
  source.setAttribute("src", gfyInfo.webmUrl);
  video.appendChild(source);

  let anchor = getGifAnchorNode(gif);
  anchor.parentNode.insertBefore(video, anchor);

  video.play();
}

function createLoadingInfoElement() {
  let loadingInfo = document.createElement("div");
  loadingInfo.classList.add("gccfx-loading-info");
  loadingInfo.setAttribute("style", "background-repeat: no-repeat; background-size: 1px 30px; background-image: url(data:image/png;base64,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TUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDE0LTAxLTAyVDIxOjAxOjA0PC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5QaXhlbG1hdG9yIDMuMDwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpDb21wcmVzc2lvbj41PC90aWZmOkNvbXByZXNzaW9uPgogICAgICAgICA8dGlmZjpSZXNvbHV0aW9uVW5pdD4xPC90aWZmOlJlc29sdXRpb25Vbml0PgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzI8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4zMDwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+MTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MzA8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAQPn3QAAAEBJREFUSA3t0qERAEAMAsHP999HukotiT6POxwGsUP1vFB+aPdmnYatIIJAANWHCAIBVB8iCARQfYggEEANPmQBfYQBwX0PxiQAAAAASUVORK5CYII=)");
  loadingInfo.textContent = "gfycat is working";
  return loadingInfo;
}

function createGalleryControlsShim(resGalleryControls) {
  let width = resGalleryControls.offsetWidth;
  let height = resGalleryControls.offsetHeight;
  let shim = document.createElement("div");
  shim.classList.add("gccfx-gallery-controls-shim");
  shim.setAttribute("style", "position:absolute; top:0; left:0; cursor:default; width: " + width + "px; height:" + height + "px ");
  shim.style.pointerEvents = "none";
  return shim;
}

function onToggleImageViewer(toggleButton) {
  let imageViewerElement = findImageViewerElement(toggleButton);
  if (!imageViewerElement) {
    return;
  }
  let expand = toggleButton.classList.contains("expanded");
  if (expand) {
    onImageViewerExpand(imageViewerElement);
    let gif = imageViewerElement.querySelector(".RESImage");
    let resGalleryControls = getResGalleryControlsNode(gif);
    if (resGalleryControls) {
      initGalleryBrowse(resGalleryControls)
    }
  } else {
    onImageViewerCollapse(imageViewerElement);
  }
}

function initGalleryBrowse(resGalleryControls) {
  if (resGalleryControls && !resGalleryControls.classList.contains("videoClick")) {
    resGalleryControls.style.position = "relative";
    resGalleryControls.classList.add("videoClick");

    let shim = createGalleryControlsShim(resGalleryControls);
    resGalleryControls.appendChild(shim);

    let nextButton = resGalleryControls.querySelector(".next");
    let prevButton = resGalleryControls.querySelector(".previous");

    let browse = function() {
      let gif = resGalleryControls.nextSibling.querySelector(".RESImage");

      gVideoLoaded = false;
      shim.style.pointerEvents = "";
      console.log("Load: " + gif.src);

      fetchGfyInfo(gif, shim)
    }
    nextButton.addEventListener("click", browse);
    prevButton.addEventListener("click", browse);
  }
}

function onImageViewerExpand(imageViewer) {
  if (pageModWorkerDestroyed) {
    return;
  }
  let gif = imageViewer.querySelector(".RESImage");
  fetchGfyInfo(gif, null);
}

function onImageViewerCollapse(imageViewer) {
  let gif = imageViewer.querySelector(".RESImage");
  gif.setAttribute("src", gif.getAttribute("data-gccfxSrc"));

  let video = imageViewer.querySelector(".gccfx-video");
  if (video) {
    video.parentNode.removeChild(video);
  }
  let loadingInfo = getLoadingInfoNode(gif);
  if (loadingInfo && loadingInfo.parentNode) {
    loadingInfo.parentNode.removeChild(loadingInfo);
  }
  let anchor = getGifAnchorNode(gif);
  anchor.style.display = "";
}

document.addEventListener("click", (event) => {
  let target = event.target;
  if (target.classList.contains("toggleImage")) {
    onToggleImageViewer(target);
  }
});
  
let css = "@keyframes gccfxLoaderAnimation { from { background-size: 1px 30px; } to { background-size: 500px 30px; } } .gccfx-loader-animation { animation-duration: 3s; animation-name: gccfxLoaderAnimation; animation-iteration-count: infinite; }";
let head = document.getElementsByTagName("head")[0];
let style = document.createElement("style");

style.type = "text/css";
style.appendChild(document.createTextNode(css));
head.appendChild(style);

