var Screenshot = {

  initScreenshotBar: function(json) {
    var screenshotsBar = getScreenshotsBarEl();
    var height = getVideoEl().videoHeight;

    var originalBottomStyle = "-" + (height - 10) + "px";
    var originalOpacityStyle = "0.3";

    screenshotsBar.style.opacity = originalOpacityStyle;
    screenshotsBar.style.height = (height + 35) + "px";
    screenshotsBar.style.bottom = originalBottomStyle;

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
      screenshotsBar.style.bottom = "0";
    });

    screenshotsBar.addEventListener("mouseleave", function() {
      if (contextMenuIsHidden) {
        screenshotsBar.style.opacity = originalOpacityStyle;
        screenshotsBar.style.bottom = originalBottomStyle;
      }
    });
  },

  create: function() {
    var videoEl = getVideoEl();
    var time = videoEl.currentTime;
    var screenshotsBar = getScreenshotsBarEl();
    var containerEl = document.createElement("div");
    var canvasEl = document.createElement("canvas");
    var screenshotInfoEl = document.createElement("div");
    var w = videoEl.videoWidth;
    var h = videoEl.videoHeight;

    containerEl.classList.add("screenshot-container");
    screenshotInfoEl.classList.add("screenshot-info");
    screenshotInfoEl.textContent = time.toPrecision(3) + "s";

    canvasEl.classList.add("screenshot-canvas");
    canvasEl.width  = w;
    canvasEl.height = h;

    var context = canvasEl.getContext("2d");
    context.drawImage(videoEl, 0, 0, w, h);

    containerEl.appendChild(canvasEl);
    containerEl.appendChild(screenshotInfoEl);

    screenshotsBar.appendChild(containerEl);
    screenshotsBar.style.display = "block";

    if (screenshotsBar.querySelectorAll("canvas").length == 1) {
      Screenshot.revealScreenshotBar();
    }
  },

  revealScreenshotBar: function() {
    var screenshotsBar = getScreenshotsBarEl();
    var currentStyleBottomProperty = screenshotsBar.style.bottom;
    // fixme: use css class.  
    screenshotsBar.style.bottom = "0";
    screenshotsBar.style.opacity = "1";
    setTimeout(function() {
      screenshotsBar.style.bottom = currentStyleBottomProperty;
      screenshotsBar.style.opacity = "0.3";
    }, 1000);
  }

};