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

function getVideoEl() {
  return document.querySelector("video");
}

function getLoadStatusEl() {
  return document.querySelector("#load-status");
}

function getInfoBoxEl() {
  return document.querySelector("#info-box");
}

function getBytesSavedEl() {
  return document.querySelector("#bytes-saved");
}

function getOriginalImageEl() {
  return document.querySelector("#original-image");
}

function getGfyUrlEl() {
  return document.querySelector("#gfy-url");
}

function updateTitle(titleStr) {
  document.title = titleStr;
}

function onTranscodeSucces(json) {
  updateAndShowVideo(json);
}

function onTranscodeError(json) {
  showImage();
}

function getBandwidthSavedInMB(json) {
  var gifSize = json.gifSize;
  var gfySize = json.gfysize;
  return (gifSize - gfySize) / 1024 / 1024;
}

function updateAndShowInfoBox(json) {
  var infoBox = getInfoBoxEl();
  var bytesSavedEl = getBytesSavedEl();
  var originalImageEl = getOriginalImageEl();
  var gfyUrlEl = getGfyUrlEl();
  var imageSrc = getURLParameter("s");

  bytesSavedEl.textContent = getBandwidthSavedInMB(json).toPrecision(2) + " MB";
  
  originalImageEl.textContent = imageSrc;
  originalImageEl.setAttribute("href", imageSrc);
  
  gfyUrlEl.textContent = "http://gfycat.com/" + json.gfyName;
  gfyUrlEl.setAttribute("href", "http://gfycat.com/" + json.gfyName);

  infoBox.style.display = "block";
}

function transcode() {
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

function updateAndShowVideo(json) {
  var videoEl = getVideoEl();
  var videoSrc = json.webmUrl;
  var sourceEl = document.createElement("source");
  videoEl.setAttribute("width", json.gifWidth);
  videoEl.setAttribute("controls", "true");
  sourceEl.setAttribute("type", "video/webm");
  sourceEl.setAttribute("src", videoSrc);
  videoEl.appendChild(sourceEl);
  videoEl.addEventListener("loadeddata", function() {
    getLoadStatusEl().style.display = "none";
    updateAndShowInfoBox(json);
    videoEl.style.display = "block";
    videoEl.play();
  });
  videoEl.addEventListener("pause", function() {
    updateTitle(TITLE + videoSrc);
  });
  videoEl.addEventListener("play", function() {
    updateTitle("▶ " + TITLE + videoSrc);
  });
}

function showImage() {
  // todo
}

window.addEventListener("load", transcode);