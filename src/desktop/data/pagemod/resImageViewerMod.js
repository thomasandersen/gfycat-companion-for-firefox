/**
 * resImageViewerMod
 * 
 * This script runs only when the RES add-on is installed (see lib/main.js).
 * Sets up listeners for when the image viewer is expaned or collapsed
 * Tries to replace the image viewer's gif with a gfycat video.
 */

let gifKey = -1;

let gifmap = new Map();

let videoLoaded = false;

let isResImageViewerSupportDisabled = false;

self.port.on("resImageViewerSupportDisabled", () => {
  isResImageViewerSupportDisabled = true;
});

self.port.on("transcodeStart", (gifUrl, gifKey) => {
  let gif = gifmap.get(gifKey);
  let statusBar = getStatusBarNode(gif);

  statusBar.textContent = "gfycat is working";

  statusBar.classList.add("gccfx-loader-bar-background");
  statusBar.classList.add("gccfx-loader-animation");
});

self.port.on("transcodeSuccess", (transcodingJson, gifKey, loadingMessage) => {
  replaceGifWithVideo(transcodingJson, gifKey, loadingMessage);
});

self.port.on("transcodeError", (gifKey, errorMessage, showErrorMessage) => {
  onTranscodeError(gifKey, errorMessage, showErrorMessage);
});

function getImageViewerNode(gif) {
  return gif.parentNode.parentNode.parentNode;
}

function getGifAnchorNode(gif) {
  return gif.parentNode;
}

function getStatusBarNode(gif) {
  return getImageViewerNode(gif).querySelector(".gccfx-status-bar");
}

function getMessageNode(gif) {
  return getImageViewerNode(gif).querySelector(".gccfx-message");
}

function getVideoNode(gif) {
  return getImageViewerNode(gif).querySelector(".gccfx-video");
}

function getVideoSizeSlider(gif) {
  return getImageViewerNode(gif).querySelector(".gccfx-video-size-slider");
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
    return galleryControls.querySelector(".gccfx-gallery-controls-shim");
  } catch(ex) {
  }
  return null;
}

function removeDomNode(node) {
  node.parentNode.removeChild(node);
}

function cleanUp(gif) {
  let video = getVideoNode(gif);
  if (video) {
    removeDomNode(video);
  }

  let videoResizer = getVideoSizeSlider(gif);
  if (videoResizer) {
    videoResizer.removeEventListener("change", onVideoResize);
    removeDomNode(videoResizer);
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

  let statusBar = getStatusBarNode(gif);
  if (statusBar) {
    removeDomNode(statusBar);
  }

  let messageNode = getMessageNode(gif);
  if (messageNode) {
    removeDomNode(messageNode);
  }
  /*
  let dummy = anchor.querySelector(".gccfx-dummy");
  if (dummy) {
    removeDomNode(dummy);
  }
  */

  gif.removeEventListener("load", gifLoaded);
}

function gifLoaded(event) {
  let gif = event.target;
  gif.style.height = "";
  gif.removeEventListener("load", gifLoaded);
}

function createGalleryControlsShim(resGalleryControls) {
  let width = resGalleryControls.offsetWidth;
  let height = resGalleryControls.offsetHeight;
  let shim = document.createElement("div");
  shim.classList.add("gccfx-gallery-controls-shim");
  shim.setAttribute("style", "width: " + width + "px; height:" + height + "px ");
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

      let height = gif.style.maxHeight ? gif.style.maxHeight : 200;
      gif.style.height = height;
      gif.addEventListener("load", gifLoaded);

      videoLoaded = false;
      shim.style.pointerEvents = "none";

      tryFetchVideo(gif);
    };
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

function onTranscodeError(gifKey, errorMessage, showErrorMessage) {
  let gif = gifmap.get(gifKey);

  console.error(errorMessage);

  cleanUp(gif);

  // Make sure that the gif is requested. 
  // The res image blocker will not block urls with gccfxDoRequest parameter
  let src = gif.getAttribute("src");
  let newSrc = !src.contains("?") ? src + "?" : src + "&";
  newSrc += "gccfxDoRequest=1";
  gif.setAttribute("src", newSrc);

  if (showErrorMessage) {
    let messageNode = getMessageNode(gif);
    if (messageNode) {
      removeDomNode(messageNode);
    }
    messageNode = createMessageNode(errorMessage);
    let anchor = getGifAnchorNode(gif);
    anchor.parentNode.insertBefore(messageNode, anchor);
  }
  
  gifmap.delete(gifKey);
}

function onVideoResize(event) {
  let resizer = event.target;
  let video = resizer.nextSibling;
  video.setAttribute("width", resizer.value);
}

function createImageResizeSlider(transcodingJson) {
  let range = document.createElement("input");
  range.classList.add("gccfx-video-size-slider");
  range.setAttribute("type", "range");
  range.setAttribute("min", (transcodingJson.gifWidth / 2));
  range.setAttribute("max", (transcodingJson.gifWidth * 2));
  range.setAttribute("step", "1");
  range.addEventListener("change", onVideoResize);

  return range;
}

function replaceGifWithVideo(transcodingJson, gifKey, loadingMessage) {
  let gif = gifmap.get(gifKey);
  let imageViewerNode = getImageViewerNode(gif);
  let video = imageViewerNode.querySelector("video");

  // Hide image.
  getGifAnchorNode(gif).style.display = "none";

  if (video) {
    removeDomNode(video);
  }

  video = document.createElement("video");
  video.setAttribute("loop", "true");
  video.setAttribute("autoplay", "true");
  video.setAttribute("controls", "true");
  video.setAttribute("width", transcodingJson.gifWidth);
  video.setAttribute("style", "display: block");
  video.setAttribute("class", "gccfx-video");
  video.addEventListener("loadeddata", () => {
    videoLoaded = true;

    // Display loading message.
    let statusBar = getStatusBarNode(gif);
    if (statusBar) {
      removeDomNode(statusBar);
    }

    // Add message
    let messageNode = getMessageNode(gif);
    if (messageNode) {
      removeDomNode(messageNode);
    }
    messageNode = createMessageNode(loadingMessage);
    video.parentNode.insertBefore(messageNode, video);
    
    // Make sure the gallery controls are enabled.
    let shim = getResGalleryControlsNodeShimNode(gif);
    if (shim) {
      shim.style.pointerEvents = "none";
    }

    let videoResizer = getVideoSizeSlider(gif);
    if (videoResizer) {
      removeDomNode(videoResizer);
    }
    videoResizer = createImageResizeSlider(transcodingJson);
    video.parentNode.insertBefore(videoResizer, video);
    videoResizer.setAttribute("value", transcodingJson.gifWidth);

    gifmap.delete(gifKey);

    console.log("Converted: " + gif.getAttribute("src"));
    console.log("shim", shim);
    console.log("---------------------------------------------");
  });

  let source = document.createElement("source");
  source.setAttribute("type", "video/webm");
  source.setAttribute("src", transcodingJson.webmUrl);
  video.appendChild(source);

  imageViewerNode.appendChild(video);
}

function addStatusBar(gif) {
  let bar = getStatusBarNode(gif);
  if (bar) {
    removeDomNode(bar);
  }
  bar = document.createElement("div");
  bar.setAttribute("class", "gccfx-status-bar");
  bar.textContent = "Checking image";
  
  let anchor = getGifAnchorNode(gif);
  anchor.parentNode.insertBefore(bar, anchor);
}

function tryFetchVideo(gif) {
  // Store reference to the gif  as the workers do not accept dom nodes.
  gifKey++;
  gifmap.set(gifKey, gif);
  
  addStatusBar(gif);

  // Tell the add-on to fetch the info.
  self.port.emit("requestGfyTranscoder", gif.src, gifKey);
}

function onImageViewerExpanded(imageViewerNode) {
  if (isResImageViewerSupportDisabled) {
    return;
  }
  let gif = imageViewerNode.querySelector(".RESImage");

  let anchor = getGifAnchorNode(gif);
  anchor.style.display = "none";
  let resGalleryControls = getResGalleryControlsNode(gif);
  if (resGalleryControls) {
    initGalleryBrowse(resGalleryControls);
  }

  // Temporary fix for galleries. 
  // Without this the gallery collapses each time a new image is loaded.
  anchor.style.overflow = "auto";

  tryFetchVideo(gif, null);
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

