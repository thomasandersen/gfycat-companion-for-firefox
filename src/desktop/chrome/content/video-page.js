var TITLE = "Gfycat Companion: ";

function getImageSrc() {
  var loc = document.location.href;
  var src = loc.split("=")[1];
  return src;
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

function updateTitle(titleStr) {
  document.title = titleStr;
}

function updateVideo(videoSrc, width) {
  var videoEl = getVideoEl();
  var sourceEl = document.createElement("source");
  videoEl.setAttribute("width", width);
  videoEl.setAttribute("controls", "true");
  sourceEl.setAttribute("type", "video/webm");
  sourceEl.setAttribute("src", videoSrc);
  videoEl.appendChild(sourceEl);
  videoEl.addEventListener("loadeddata", function() {
    getLoadStatusEl().style.display = "none";
    getVideoEl().style.display = "block";
    videoEl.play();
  });

  videoEl.addEventListener("pause", function() {
    updateTitle(TITLE + videoSrc);
  });

  videoEl.addEventListener("play", function() {
    updateTitle("▶ " + TITLE + ": " + videoSrc);
  });
}

function showImage() {
  // todo
}

function onTranscodeSucces(json) {
  updateVideo(json.webmUrl, json.gifWidth);
}

function onTranscodeError(json) {
  showImage();
}

function transcode() {
  var req = new XMLHttpRequest();
  var random = createPsudoRandomStr(6);
  var imgSrc = getImageSrc();
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

window.addEventListener("load", transcode);

/*
{"gfyname":"BlandInexperiencedDuiker","gfyName":"BlandInexperiencedDuiker","gfysize":133382,"gifSize":1375488,"gifWidth":402,"mp4Url":"http:\/\/zippy.gfycat.com\/BlandInexperiencedDuiker.mp4","webmUrl":"http:\/\/zippy.gfycat.com\/BlandInexperiencedDuiker.webm","frameRate":11,"gifUrl":"http:\/\/fat.gfycat.com\/BlandInexperiencedDuiker.gif"}
*/