var ScreenShot = {

  initScreenShotBar: function() {
    var bar = getScreenshotsBarElem();
    var height = getVideoElem().videoHeight;
    var originalBottomStyle = "-" + (height - 10) + "px";
    var originalOpacityStyle = "0.3";
    var contextMenu = mainWindow.document.querySelector("#contentAreaContextMenu");
    var contextMenuIsHidden = true;

    bar.style.opacity = originalOpacityStyle;
    bar.style.height = (height + 24) + "px";
    bar.style.bottom = originalBottomStyle;

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
    var videoElem = getVideoElem();
    var time = videoElem.currentTime;
    var screenShotsBar = getScreenshotsBarElem();
    var containerElem = document.createElement("div");
    var canvasElem = document.createElement("canvas");
    var screenShotInfoElem = document.createElement("div");
    var removeButtonElem = document.createElement("div");
    var w = videoElem.videoWidth;
    var h = videoElem.videoHeight;

    containerElem.classList.add("screenshot-container");
    screenShotInfoElem.classList.add("screenshot-info");
    screenShotInfoElem.textContent = time.toPrecision(3) + "s";
    removeButtonElem.classList.add("screenshot-remove-button");
    removeButtonElem.classList.add("fa");
    removeButtonElem.classList.add("fa-times");
    removeButtonElem.addEventListener("click", function() {
      containerElem.parentNode.removeChild(containerElem);
    });

    canvasElem.classList.add("screenshot-canvas");
    canvasElem.width  = w;
    canvasElem.height = h;

    var context = canvasElem.getContext("2d");
    context.drawImage(videoElem, 0, 0, w, h);

    containerElem.appendChild(canvasElem);
    containerElem.appendChild(screenShotInfoElem);
    containerElem.appendChild(removeButtonElem);

    screenShotsBar.appendChild(containerElem);
    screenShotsBar.style.display = "block";

    if (screenShotsBar.querySelectorAll("canvas").length == 1) {
      ScreenShot.revealScreenShotBar();
    }

    setTimeout(function() {
      var scrollTo = containerElem.offsetLeft + containerElem.offsetWidth;
      $(screenShotsBar).getNiceScroll().doScrollPos(scrollTo,0);
    }, 10);
  },

  revealScreenShotBar: function() {
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