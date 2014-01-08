/**
 * resImageViewerMod
 * 
 * This script runs only when the RES add-on is installed (see lib/main.js).
 * Sets up listeners for when the image viewer is expaned or collapsed
 * Tries to replace the image viewer's gif with a gfycat video.
 *
 * Todo: Research support multiple images in image viewer.
 *       Test page: http://www.reddit.com/r/gifs/comments/1ty6ft/stereographic_3d_drawings/
 *
 * Todo: Should we modify .RESImagePlaceholder ?
 *
 */

let gifKey = -1;

let gifmap = new Map();

let videoLoaded = false;

let isResImageViewerSupportDisabled = false;

self.port.on("resImageViewerSupportDisabled", () => {
  isResImageViewerSupportDisabled = true;
});

self.port.on("gfyInfoFetchSuccess", (gfyInfo, gifKey, loadingMessage) => {
  addVideo(gfyInfo, gifKey, loadingMessage);
});

self.port.on("gfyInfoFetchError", (gfyInfo, gifKey, errorMessage) => {
  fallbackToOriginalImage(gfyInfo, gifKey, errorMessage);
});

function getImageViewerNode(gif) {
  return gif.parentNode.parentNode.parentNode;
}

function getGifAnchorNode(gif) {
  return gif.parentNode;
}

function getLoadingBarNode(gif) {
  return getImageViewerNode(gif).querySelector(".gccfx-loader-bar");
}

function getMessageNode(gif) {
  return getImageViewerNode(gif).querySelector(".gccfx-message");
}

function getVideoNode(gif) {
  return getImageViewerNode(gif).querySelector(".gccfx-video");
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

function getImageSrc(gif) {
  return gif.getAttribute("data-gccfxOriginalSrc");
}

function urlEndsWithDotGif(url) {
  return /\.gif.*$/.test(url);
}

function cleanUp(gif) {
  let video = getVideoNode(gif);
  if (video) {
    video.parentNode.removeChild(video);
  }

  let shim = getResGalleryControlsNodeShimNode(gif);
  if (shim) {
    shim.style.pointerEvents = "none";
  }

  let anchor = getGifAnchorNode(gif);
  if (anchor) {
    anchor.style.display = "";
  }

  gif.nextSibling.style.width = gif.width + "px";
  gif.nextSibling.style.height = gif.height + "px";

  let loadingBarNode = getLoadingBarNode(gif);
  if (loadingBarNode) {
    loadingBarNode.parentNode.removeChild(loadingBarNode);
  }

  let messageNode = getMessageNode(gif);
  if (messageNode) {
    messageNode.parentNode.removeChild(messageNode);
  }
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

      videoLoaded = false;
      shim.style.pointerEvents = "none";

      fetchVideo(gif);
    }
    nextButton.addEventListener("click", browse);
    prevButton.addEventListener("click", browse);
  }
}

function createMessageNode(message) {
  let node = document.createElement("div");
  node.classList.add("gccfx-message");
  node.textContent = message;
  return node;
}

function fallbackToOriginalImage(gfyInfo, gifKey, errorMessage) {
  let gif = gifmap.get(gifKey);

  console.error(errorMessage);

  cleanUp(gif);

  // Make sure that the gif is requested. 
  // httpRequestListener will not block urls with gccfxDoRequest parameter
  let src = gif.getAttribute("src");
  let newSrc = !src.contains("?") ? src + "?" : src + "&";
  newSrc += "gccfxDoRequest=1";
  gif.setAttribute("src", newSrc);
  
  gifmap.delete(gifKey);
}

function addVideo(gfyInfo, gifKey, loadingMessage) {
  let gif = gifmap.get(gifKey);

  let imageViewerNode = getImageViewerNode(gif);
  let video = imageViewerNode.querySelector("video");

  // Hide image.
  getGifAnchorNode(gif).style.display = "none";

  if (video) {
    video.parentNode.removeChild(video);
  }

  video = document.createElement("video");
  video.setAttribute("loop", "true");
  video.setAttribute("autoplay", "true");
  video.setAttribute("controls", "true");
  video.setAttribute("width", gfyInfo.gifWidth);
  video.setAttribute("style", "display: block");
  video.setAttribute("class", "gccfx-video");
  video.addEventListener("loadeddata", () => {
    videoLoaded = true;

    // Display loading message.
    let loaderBar = getLoadingBarNode(gif);
    if (loaderBar) {
      loaderBar.parentNode.removeChild(loaderBar);
    }

    // Add message
    let messageNode = getMessageNode(gif);
    if (messageNode) {
      messageNode.parentNode.removeChild(messageNode);
    }
    messageNode = createMessageNode(loadingMessage);
    video.parentNode.insertBefore(messageNode, video);
    //imageViewerNode.appendChild(messageNode);
    
    // Make sure the gallery controls are enabled.
    let shim = getResGalleryControlsNodeShimNode(gif);
    if (shim) {
      shim.style.pointerEvents = "none";
    }

    gifmap.delete(gifKey);

    console.log("Converted: " + gif.getAttribute("src"));
    console.log("shim", shim);
    console.log("---------------------------------------------");
  });

  let source = document.createElement("source");
  source.setAttribute("type", "video/webm");
  source.setAttribute("src", gfyInfo.webmUrl);
  video.appendChild(source);

  imageViewerNode.appendChild(video);
}

function addLoaderBar(gif) {
  let bar = getLoadingBarNode(gif);
  if (bar) {
    bar.parentNode.removeChild(bar);
  }
  bar = document.createElement("div");
  bar.setAttribute("class", "gccfx-loader-bar gccfx-loader-bar-background gccfx-loader-animation");
  bar.textContent = "Contacting gfycat";
  let imageViewerNode = getImageViewerNode(gif);
  
  let anchor = getGifAnchorNode(gif);
  anchor.parentNode.insertBefore(bar, anchor);
  //imageViewerNode.appendChild(bar);
}

function fetchVideo(gif) {
  if (!urlEndsWithDotGif(gif.src)) {
    cleanUp(gif);
    return;  
  }
  
  // Add the loader bar.
  addLoaderBar(gif);

  // Store reference to the gif  as the workers do not accept dom nodes.
  gifKey++;
  gifmap.set(gifKey, gif);

  // Tell the add-on to fetch the info.
  self.port.emit("fetchGfyInfo", encodeURIComponent(gif.src), gifKey);
}

function onImageViewerExpanded(imageViewerNode) {
  if (isResImageViewerSupportDisabled) {
    return;
  }

  let gif = imageViewerNode.querySelector(".RESImage");
  // Modify RES elements.
  let anchor = getGifAnchorNode(gif);
  anchor.style.display = "none";
  let resGalleryControls = getResGalleryControlsNode(gif);
  if (resGalleryControls) {
    initGalleryBrowse(resGalleryControls)
  }

  fetchVideo(gif, null);
}

function onImageViewerCollapsed(imageViewerNode) {
  let gif = imageViewerNode.querySelector(".RESImage");
  if (gif) {
    cleanUp(gif);
  }
}

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

    let expand = target.classList.contains("expanded");
    if (expand) {
      onImageViewerExpanded(imageViewerNode);
    } else {
      onImageViewerCollapsed(imageViewerNode);
    }
  }
});

