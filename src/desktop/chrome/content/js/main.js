Components.utils.import("chrome://gfycat/content/jsm/bytesSaved.jsm");

var Ci = Components.interfaces;
var mainWindow = window.QueryInterface(Ci.nsIInterfaceRequestor)
                   .getInterface(Ci.nsIWebNavigation)
                   .QueryInterface(Ci.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Ci.nsIInterfaceRequestor)
                   .getInterface(Ci.nsIDOMWindow);

var TITLE_TEXT_PREFIX = "Gfycat Companion: ";

function onTranscodeSucces(json) {
  loadHtml5Video(json);
}

function onTranscodeError(json) {
  loadFallbackImage();
  removeLoadingSplash();
  clearInfoBox();
  showErrorMessage(json);
}

function doTranscode() {
  var request = new XMLHttpRequest();
  var random = Helper.createPsudoRandomStr(6);
  var imageSrc = Helper.getURLParameter("s");
  var url = "http://upload.gfycat.com/transcode/" + random + "?fetchUrl=" + imageSrc;

  request.open("GET", url, true);
  request.onload = function(e) {
    try {
      var json = JSON.parse(request.responseText);
      if (json.error) {
        onTranscodeError(json);
      } else {
        onTranscodeSucces(json);
      }
    } catch(ex) {
      onTranscodeError(null);
    }
  };
  document.title = TITLE_TEXT_PREFIX + "transcoding in progress...";
  request.send();
}

function loadHtml5Video(json) {
  var videoEl = getVideoElem();

  var webMsourceEl = document.createElement("source");
  webMsourceEl.setAttribute("type", "video/webm");
  webMsourceEl.setAttribute("src", json.webmUrl);

  var mp4sourceEl = document.createElement("source");
  mp4sourceEl.setAttribute("type", "video/mp4");
  mp4sourceEl.setAttribute("src", json.mp4Url);

  videoEl.setAttribute("width", json.gifWidth);
  videoEl.setAttribute("controls", "true");

  videoEl.appendChild(webMsourceEl);
  videoEl.appendChild(mp4sourceEl);

  videoEl.addEventListener("loadeddata", function() {
    onVideoLoaded(json);
  });

  videoEl.addEventListener("pause", function() {
    document.title = TITLE_TEXT_PREFIX;
  });

  videoEl.addEventListener("play", function() {
    document.title = "▶ " + TITLE_TEXT_PREFIX;
  });
}

function onVideoLoaded(json) {
  initVideoControls(json);
  initInfoPanel(json);
  removeLoadingSplash();
  getVideoElem().style.display = "block";
  ScreenShot.initScreenShotBar(json);
  saveBandwidthSaved(json);
}

function loadFallbackImage() {
  var video = getVideoElem();
  var img = document.createElement("img");
  img.setAttribute("id", "fallback");
  img.setAttribute("src", Helper.getURLParameter("s"));
  video.parentNode.insertBefore(img, video);
}

function initInfoPanel(json) {
  var panel = getInfoPanelElem();
  var allInputs = panel.querySelectorAll("input");
  var bytesSavedEl = getBytesSavedElem();
  var totalBytesSavedEl = getTotalBytesSavedElem();
  var gfycatSrc = "http://gfycat.com/" + json.gfyName;

  getGfycatUrlElem().value = gfycatSrc;
  getGfycatVideoUrlElem().value = json.webmUrl;

  var bytesSaved = getBandwidthSavedInMB(json).toFixed(2);
  bytesSavedEl.textContent = "About " + bytesSaved + " MB of bandwidth was saved";

  var totalBytesSaved = getTotalBandwidthSavedInMB().toFixed(2);
  if (totalBytesSaved != null) {
    totalBytesSavedEl.textContent = "Total bandwith saved: " + totalBytesSaved + " MB";
  }

  for (var key in allInputs) {
    if (allInputs[key].type == "text") {
      addClickEventForLinkInput(allInputs[key]);
    }
  }
}

function addClickEventForLinkInput(input) {
  input.addEventListener("click", function() {
    input.select();
  });
}

function removeLoadingSplash() {
  var splash = getLoadingSplashElem();
  if (splash) {
    splash.parentNode.removeChild(splash);
  }
}

function showErrorMessage(json) {
  var errorMessageEl = getErrorMessageElem();
  var text = "Showing original image.";
  if (json && json.error) {
    text += (" " + json.error);
  }
  errorMessageEl.textContent = text;
  errorMessageEl.style.display = "block";
}

function clearInfoBox() {
  getGfycatUrlElem().value = "";
  getGfycatVideoUrlElem().value = "";
}

(function() {
  var infoButton = getInfoButtonElem();
  var controlPanel = getControlsElem();
  var infoPanel = getInfoPanelElem();
  var imageSrc = Helper.getURLParameter("s");

  if (imageSrc.contains("?")) {
    imageSrc += "&gccfxDoRequest=1";
  } else {
    imageSrc += "?gccfxDoRequest=1";
  }

  getOriginalImageElem().value = imageSrc;
  getGfycatUrlElem().value = "transcoding in progress...";
  getGfycatVideoUrlElem().value = "transcoding in progress...";

  infoButton.addEventListener("click", function() {
    var style = infoPanel.style;
    style.display = (style.display == "block") ? "none" : "block";
  });

  document.addEventListener("click", function(evt) {
    var target = evt.target;
    var isPanel = DomHelper.findParentBySelector(target, "#info-panel") != null;
    var close = !(isPanel || target.id == "info");
    if (close) {
      infoPanel.style.display = "none";
    }
  });

  doTranscode();
}());