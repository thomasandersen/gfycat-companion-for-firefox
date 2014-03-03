var Screenshot = {
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
    var currentStyleRightProperty = screenshotsBar.style.right;
    // fixme: use css class.  
    screenshotsBar.style.right = "0";
    screenshotsBar.style.opacity = "1";
    setTimeout(function() {
      screenshotsBar.style.right = currentStyleRightProperty;
      screenshotsBar.style.opacity = "0.3";
    }, 1000);
  }

};