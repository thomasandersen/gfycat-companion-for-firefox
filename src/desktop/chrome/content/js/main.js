Components.utils.import("chrome://gfycat/content/jsm/bytesSaved.jsm");

var Ci = Components.interfaces;
var mainWindow = window.QueryInterface(Ci.nsIInterfaceRequestor)
                   .getInterface(Ci.nsIWebNavigation)
                   .QueryInterface(Ci.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Ci.nsIInterfaceRequestor)
                   .getInterface(Ci.nsIDOMWindow);

var TITLE = "Gfycat Companion: ";

function onTranscodeSucces(json) {
  loadHtml5Video(json);
}

function onTranscodeError(json) {
  loadFallbackImage(json);
}

function doTranscode() {
  var request = new XMLHttpRequest();
  var random = createPsudoRandomStr(6);
  var imageSrc = getURLParameter("s");
  var url = "http://upload.gfycat.com/transcode/" + random + "?fetchUrl=" + imageSrc;

  request.open("GET", url, true);
  request.onload = function(e) {
    try {
      var json = JSON.parse(request.responseText);
      if (json.error) {
        onTranscodeError();
      } else {
        onTranscodeSucces(json);
      }
    } catch(ex) {
      onTranscodeError();
    }
  };
  updateTitle(TITLE + "transcoding gif...");
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
    updateTitle(TITLE + videoSrc);
  });

  videoEl.addEventListener("play", function() {
    updateTitle("▶ " + TITLE + videoSrc);
  });
}

function onVideoLoaded(json) {
  initVideoControls(json);
  initResizer(json);
  initInfoBox(json);
  initLinkPanel(json);
  initScreenshotBar(json);

  getLoadingSplashEl().style.display = "none";
  getVideoEl().style.display = "block";

  saveBandwidthSaved(json);
}

function loadFallbackImage(json) {
  // todo
  console.log("show image");
}

function initInfoBox(json) {
  getMegaBytesSavedEl().textContent = getBandwidthSavedInMB(json).toPrecision(2) + " MB";
  getInfoBoxEl().style.display = "block";
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

function initResizer(json) {
  var resizerEl = getResizerEl();
  var videoEl = getVideoEl();

  resizerEl.removeAttribute("disabled");
  resizerEl.setAttribute("min", json.gifWidth / 2);
  resizerEl.setAttribute("max", json.gifWidth * 2);
  resizerEl.setAttribute("step", "1");
  resizerEl.setAttribute("value", json.gifWidth);
  resizerEl.addEventListener("input", function() {
    videoEl.setAttribute("width", resizerEl.value);
  });

  document.addEventListener("DOMMouseScroll", function(event) {
    var up = event.detail < 0;
    var currentValue = parseInt(resizerEl.value, 10);
    var step = 20;
    resizerEl.value = (up ? currentValue + step : currentValue - step);
    
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("input", false, true);
    resizerEl.dispatchEvent(evt);
  });
}

function initScreenshotBar(json) {
  var screenshotsBar = getScreenshotsBarEl();
  var originalRightStyle = "-" + (json.gifWidth - 10) + "px";
  var originalOpacityStyle = "0.3";

  screenshotsBar.style.opacity = originalOpacityStyle;
  screenshotsBar.style.width = (json.gifWidth + 20) + "px";
  screenshotsBar.style.right = originalRightStyle;

  var contextMenu = mainWindow.document.querySelector("#contentAreaContextMenu");
  var contextMenuIsHidden = true;

  contextMenu.addEventListener("popupshowing", function() {
    contextMenuIsHidden = false;
  });

  contextMenu.addEventListener("popuphiding", function() {
    contextMenuIsHidden = true;
  });

  screenshotsBar.addEventListener("mouseenter", function() {
    screenshotsBar.style.opacity = "1";
    screenshotsBar.style.right = "0";
  });

  screenshotsBar.addEventListener("mouseleave", function() {
    if (contextMenuIsHidden) {
      screenshotsBar.style.opacity = originalOpacityStyle;
      screenshotsBar.style.right = originalRightStyle;
    }
  });
}

(function() {
  var linkButton = getLinkButtonEl();
  var linksPanel = getLinksPanelEl();
  var imageSrc = getURLParameter("s");

  if (imageSrc.contains("?")) {
    imageSrc += "&gccfxDoRequest=1";
  } else {
    imageSrc += "?gccfxDoRequest=1";
  }

  if (window.history.length > 1) {
    getBackButtonEl().removeAttribute("disabled");
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