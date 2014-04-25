var Screenshot = {

  initScreenshotBar: function(json) {
    var bar = getScreenshotsBarElem();

    var height = getVideoElem().videoHeight;

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
      getVideoElem().style.opacity = 0.3;
      bar.style.opacity = "1";
      bar.style.bottom = "0";
    });

    bar.addEventListener("mouseleave", function(event) {
      if (event.pageY > bar.offsetTop) {
        return;
      }

      if (contextMenuIsHidden) {
        getVideoElem().style.opacity = 1;
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
    }, 300);
  },

  create: function() {
    var videoEl = getVideoElem();
    var time = videoEl.currentTime;
    var screenshotsBar = getScreenshotsBarElem();
    var containerEl = document.createElement("div");
    var canvasEl = document.createElement("canvas");
    var screenshotInfoEl = document.createElement("div");
    var removeButtonEl = document.createElement("div");
    var w = videoEl.videoWidth;
    var h = videoEl.videoHeight;

    containerEl.classList.add("screenshot-container");
    screenshotInfoEl.classList.add("screenshot-info");
    screenshotInfoEl.textContent = time.toPrecision(3) + "s";
    removeButtonEl.classList.add("screenshot-remove-button");
    removeButtonEl.classList.add("fa");
    removeButtonEl.classList.add("fa-times");
    removeButtonEl.addEventListener("click", function() {
      containerEl.parentNode.removeChild(containerEl);
    });

    canvasEl.classList.add("screenshot-canvas");
    canvasEl.width  = w;
    canvasEl.height = h;

    var context = canvasEl.getContext("2d");
    context.drawImage(videoEl, 0, 0, w, h);

    containerEl.appendChild(canvasEl);
    containerEl.appendChild(screenshotInfoEl);
    containerEl.appendChild(removeButtonEl);

    screenshotsBar.appendChild(containerEl);
    screenshotsBar.style.display = "block";

    if (screenshotsBar.querySelectorAll("canvas").length == 1) {
      Screenshot.revealScreenshotBar();
    }

    setTimeout(function() {
      var scrollTo = containerEl.offsetLeft + containerEl.offsetWidth;
      $(screenshotsBar).getNiceScroll().doScrollPos(scrollTo,0);
    }, 10);
  },

  revealScreenshotBar: function() {
    var screenshotsBar = getScreenshotsBarElem();
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