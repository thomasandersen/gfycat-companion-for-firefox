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
  if (json.error) {
    showInfoBox("Showing original image. " + json.error);
  }
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
  document.title = TITLE_TEXT_PREFIX + "transcoding gif...";
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

  videoEl.addEventListener("loadeddata", function() {
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
  showInfoBox("About " + getBandwidthSavedInMB(json).toPrecision(2) + " MB of internet bandwidth was saved");
  initLinkPanel(json);
  
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

  removeLoadingSplash();

  video.parentNode.insertBefore(img, video);
}

function showInfoBox(text) {
  /*
  getGfyInfoEl().textContent = text;
  getInfoBoxEl().style.display = "block";
  */
}

function initLinkPanel(json) {
  var linksPanel = getLinksPanelEl();
  var allInputs = linksPanel.querySelectorAll("input");
  var gfycatSrc = "http://gfycat.com/" + json.gfyName;

  getGfycatUrlEl().value = gfycatSrc;
  getGfycatVideoUrlEl().value = json.webmUrl;

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
  splash.parentNode.removeChild(splash);
}

(function() {
  var linkButton = getLinkButtonEl();
  var linksPanel = getLinksPanelEl();
  var imageSrc = Helper.getURLParameter("s");

  if (imageSrc.contains("?")) {
    imageSrc += "&gccfxDoRequest=1";
  } else {
    imageSrc += "?gccfxDoRequest=1";
  }

  getOriginalImageEl().value = imageSrc;
  getGfycatUrlEl().value = "transcoding gif...";
  getGfycatVideoUrlEl().value = "transcoding gif...";

  linkButton.addEventListener("click", function() {
    linksPanel.style.top = (linkButton.offsetTop + linkButton.offsetHeight + 10) + "px";
    linksPanel.style.left = linkButton.offsetLeft + "px";
    linksPanel.style.display = "block";
  });

  document.addEventListener("click", function(evt) {
    var target = evt.target;
    var close = !(target.id == "link" || target.id == "link-panel" || target.parentNode.id == "link-panel");
    if (close) {
      linksPanel.style.display = "none";
    }
  });

  doTranscode();
}());