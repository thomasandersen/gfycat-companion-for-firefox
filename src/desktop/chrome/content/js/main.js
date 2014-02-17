Components.utils.import("chrome://gfycat/content/jsm/bytesSaved.jsm");

var TITLE = "Gfycat Companion: ";

function getURLParameter(name) {
  return decodeURI(
    (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
}

function createPsudoRandomStr(stringLength) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i=0; i < stringLength; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function truncateString(str, length) {
  if (str.length > length) {
    return str.substring(0, length);
  }
  return str;
}

function onTranscodeSucces(json) {
  loadVideo(json);
}

function onTranscodeError(json) {
  showImage();
}

function doTranscode() {
  var req = new XMLHttpRequest();
  var random = createPsudoRandomStr(6);
  var imgSrc = getURLParameter("s");
  var url = "http://upload.gfycat.com/transcode/" + random + "?fetchUrl=" + imgSrc;

  req.open("GET", url, true);
  req.onload = function(e) {
    var json = JSON.parse(req.responseText);
    if (json.error) {
      onTranscodeError(json);
    } else {
      onTranscodeSucces(json);
    }
  };
  req.send();
  updateTitle(TITLE + "transcoding gif...");
}

function loadVideo(json) {
  var videoEl = getVideoEl();
  var videoSrc = json.webmUrl;
  var sourceEl = document.createElement("source");

  videoEl.setAttribute("width", json.gifWidth);
  videoEl.setAttribute("controls", "true");
  sourceEl.setAttribute("type", "video/webm");
  sourceEl.setAttribute("src", videoSrc);
  videoEl.appendChild(sourceEl);
  videoEl.addEventListener("loadeddata", function() {
    onVideoLoaded(json);
  });
  videoEl.addEventListener("pause", function() {
    updateTitle(TITLE + videoSrc);
  });
  videoEl.addEventListener("play", function() {
    updateTitle("▶ " + TITLE + videoSrc);
  });
}

function onVideoLoaded(json) {
  getLoadStatusEl().style.display = "none";
  getVideoEl().style.display = "block";
  updateControls(json);
  updateResizer(json);
  updateInfo(json);
  saveBandwidthSaved(json);
}

function updateInfo(json) {
  var infoBox = getInfoBoxEl();
  var mbSavedEl = getMegaBytesSavedEl();
  var originalImageEl = getOriginalImageEl();
  var gfycatUrlEl = getGfycatUrlEl();
  var imageSrc = getURLParameter("s");
  var gfycatSrc = "http://gfycat.com/" + json.gfyName;

  mbSavedEl.textContent = getBandwidthSavedInMB(json).toPrecision(2) + " MB";
  originalImageEl.textContent = truncateString(imageSrc, 50) + "\u2026";
  originalImageEl.setAttribute("title", imageSrc);
  originalImageEl.setAttribute("href", imageSrc);
  gfycatUrlEl.textContent = gfycatSrc;
  gfycatUrlEl.setAttribute("title", gfycatSrc);
  gfycatUrlEl.setAttribute("href", "http://gfycat.com/" + json.gfyName);

  infoBox.style.display = "block";
}

function updateResizer(json) {
  var resizerEl = getResizerEl();
  var videoEl = getVideoEl();

  resizerEl.removeAttribute("disabled");
  resizerEl.setAttribute("min", json.gifWidth / 2);
  resizerEl.setAttribute("max", json.gifWidth * 2);
  resizerEl.setAttribute("step", "1");
  resizerEl.setAttribute("value", json.gifWidth);
  resizerEl.addEventListener("change", function() {
    videoEl.setAttribute("width", resizerEl.value);
  });
}

function showImage() {
  // todo
}

function updateTitle(titleStr) {
  document.title = titleStr;
}

window.addEventListener("load", doTranscode);