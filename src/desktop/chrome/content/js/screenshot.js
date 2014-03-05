var Screenshot = {

  initScreenshotBar: function(json) {
    var bar = getScreenshotsBarEl();

    var height = getVideoEl().videoHeight;

    var originalBottomStyle = "-" + (height - 10) + "px";
    var originalOpacityStyle = "0.3";

    bar.style.opacity = originalOpacityStyle;
    bar.style.height = (height + 24) + "px";
    bar.style.bottom = originalBottomStyle;

    var contextMenu = mainWindow.document.querySelector("#contentAreaContextMenu");
    var contextMenuIsHidden = true;

    contextMenu.addEventListener("popupshowing", function() {
      contextMenuIsHidden = false;
    });

    contextMenu.addEventListener("popuphiding", function() {
      contextMenuIsHidden = true;
    });

    bar.addEventListener("mouseenter", function() {
      getVideoEl().style.opacity = 0.3;
      bar.style.opacity = "1";
      bar.style.bottom = "0";
    });

    bar.addEventListener("mouseleave", function(event) {
      console.log(event);
      if (event.pageY > bar.offsetTop) {
        return;
      }

      if (contextMenuIsHidden) {
        getVideoEl().style.opacity = 1;
        bar.style.opacity = originalOpacityStyle;
        bar.style.bottom = originalBottomStyle;
      }
    });

    // Add nice scroll to the bar.
    // Set timeout in order to avoid flickering.
    setTimeout(function() {
      $(bar).niceScroll({
        autohidemode:false,
        cursorborder: "",
        railhoffset: {top: -4},
        background: "#000"
      });
    }, 10);
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