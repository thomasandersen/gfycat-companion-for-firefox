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
  var videoEl = getVideoEl();
  var videoSrc = json.webmUrl;
  var sourceEl = document.createElement("source");

  videoEl.setAttribute("width", json.gifWidth);
  videoEl.setAttribute("controls", "true");
  sourceEl.setAttribute("type", "video/webm");
  sourceEl.setAttribute("src", videoSrc);
  videoEl.appendChild(sourceEl);

  videoEl.addEventListener("canplay", function() {
    onVideoLoaded(json);
  });

  videoEl.addEventListener("pause", function() {
    document.title = TITLE_TEXT_PREFIX + videoSrc;
  });

  videoEl.addEventListener("play", function() {
    document.title = "▶ " + TITLE_TEXT_PREFIX + videoSrc;
  });
}

function onVideoLoaded(json) {
  initVideoControls(json);
  initInfoPanel(json);
  removeLoadingSplash();
  getVideoEl().style.display = "block";
  Screenshot.initScreenshotBar(json);
  saveBandwidthSaved(json);
}

function loadFallbackImage() {
  var video = getVideoEl();
  var img = document.createElement("img");
  img.setAttribute("id", "fallback");
  img.setAttribute("src", Helper.getURLParameter("s"));
  video.parentNode.insertBefore(img, video);
}

function initInfoPanel(json) {
  var panel = getInfoPanelEl();
  var allInputs = panel.querySelectorAll("input");
  var bytesSavedEl = getBytesSavedEl();
  var totalBytesSavedEl = getTotalBytesSavedEl();
  var gfycatSrc = "http://gfycat.com/" + json.gfyName;

  getGfycatUrlEl().value = gfycatSrc;
  getGfycatVideoUrlEl().value = json.webmUrl;

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
  var splash = getLoadingSplashEl();
  if (splash) {
    splash.parentNode.removeChild(splash);
  }
}

function showErrorMessage(json) {
  var errorMessageEl = getErrorMessageEl();
  var text = "Showing original image.";
  if (json && json.error) {
    text += (" " + json.error);
  }
  errorMessageEl.textContent = text;
  errorMessageEl.style.display = "block";
}

function clearInfoBox() {
  getGfycatUrlEl().value = "";
  getGfycatVideoUrlEl().value = "";
}

(function() {
  var infoButton = getInfoButtonEl();
  var infoPanel = getInfoPanelEl();
  var imageSrc = Helper.getURLParameter("s");

  if (imageSrc.contains("?")) {
    imageSrc += "&gccfxDoRequest=1";
  } else {
    imageSrc += "?gccfxDoRequest=1";
  }

  getOriginalImageEl().value = imageSrc;
  getGfycatUrlEl().value = "transcoding in progress...";
  getGfycatVideoUrlEl().value = "transcoding in progress...";

  infoButton.addEventListener("click", function() {
    infoPanel.style.top = (infoButton.offsetTop + infoButton.offsetHeight + 5) + "px";
    infoPanel.style.right = "10px";
    infoPanel.style.display = "block";
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