// fixme: namespace

function onPlayPause() {
  var playPauseButton = getPlayPauseButtonEl();
  var videoEl = getVideoEl();
  if (videoEl.paused) {
    videoEl.play();
  } else {
    videoEl.pause();
  }
}

function onFullScreen() {
  var videoEl = getVideoEl();
  Helper.requestFullscreen(videoEl);
}

function onDecreaseSpeed() {
  var videoEl = getVideoEl();
  videoEl.play();
  if (videoEl.playbackRate > 0.1) {
    videoEl.playbackRate -= 0.1;
    updateCurrentSpeedDisplay();
  }
}

function onIncreaseSpeed() {
  var videoEl = getVideoEl();
  videoEl.play();
  if (videoEl.playbackRate < 5) {
    videoEl.playbackRate += 0.1;
    updateCurrentSpeedDisplay();
  }
}

function navigateToFrame(direction, json) {
  var videoEl = getVideoEl();
  if (!videoEl.paused) {
    videoEl.pause();
  }
  var time;
  if (direction == "next") {
    time = videoEl.currentTime + (json.frameRate / 1000);
  } else if (direction == "previous") {
    time = videoEl.currentTime - (json.frameRate / 1000);
  }
  videoEl.currentTime = time;
}

function toggleResizePanel(event) {
  var resizeButton = event.target;
  var panel = getResizePanelEl();
  var style = panel.style;
  if (style.display == "block") {
    panel.style.display = "none";
  } else {
    panel.style.display = "block";
  }

  style.top = (resizeButton.offsetTop + resizeButton.offsetHeight) + "px";
  style.left = resizeButton.offsetLeft + "px";
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

  function triggerInputEvent() {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("input", false, true);
    resizerEl.dispatchEvent(evt);
  }

  document.addEventListener("click", function(event) {
    if (!DomHelper.findParentBySelector(event.target, "#controls")) {
      getResizePanelEl().style.display = "none";
    }
  });

  document.addEventListener("DOMMouseScroll", function(event) {
    var target = event.target;
    if (DomHelper.findParentBySelector(target, "#screenshots-bar")) {
      return;
    }

    var up = event.detail < 0;
    var currentValue = parseInt(resizerEl.value, 10);
    var step = 25;
    resizerEl.value = (up ? currentValue + step : currentValue - step);

    triggerInputEvent();
  });

  getResetResizeButtonEl().addEventListener("click", function() {
    resizerEl.value = json.gifWidth;
    triggerInputEvent();
  });
}

function updateCurrentSpeedDisplay() {
  var videoEl = getVideoEl();
  getCurrentSpeedEl().textContent = videoEl.playbackRate.toFixed(1);

}

function initVideoControls(json) {
  var controlsEl = getControlsEl();
  var videoEl = getVideoEl();
  var playPauseButton = getPlayPauseButtonEl();
  var fullscreenButton = getFullscreenButtonEl();
  var increaseSpeedButton = getIncreaseSpeedButtonEl();
  var decreaseSpeedButton = getDecreaseSpeedButtonEl();
  var nextFrameButton = getNextFrameButtonEl();
  var previousFrameButton = getPreviousFrameButtonEl();
  var screenshotButton = getScreenshotButtonEl();
  var resizeButton = getResizeButtonEl();
  var currentTimeElem = getCurrentTimeEl();
  var currentFrameElem = getCurrentFrameEl();

  initResizer(json);

  videoEl.addEventListener("play", function() {
    playPauseButton.classList.add("fa-pause");
    playPauseButton.classList.remove("fa-play");
  });

  videoEl.addEventListener("pause", function() {
    playPauseButton.classList.add("fa-play");
    playPauseButton.classList.remove("fa-pause");
  });

  videoEl.addEventListener("timeupdate", function() {
    var currentTime = videoEl.currentTime;
    currentTimeElem.textContent = currentTime.toFixed(2);
    currentFrameElem.textContent = Math.round((currentTime * json.frameRate).toPrecision(6));
    updateCurrentSpeedDisplay();
  });

  playPauseButton.addEventListener("click", onPlayPause);

  fullscreenButton.addEventListener("click", onFullScreen);

  decreaseSpeedButton.addEventListener("click", onDecreaseSpeed);

  increaseSpeedButton.addEventListener("click", onIncreaseSpeed);

  previousFrameButton.addEventListener("click", function() {
    navigateToFrame("previous", json);
  });

  nextFrameButton.addEventListener("click", function() {
    navigateToFrame("next", json);
  });

  screenshotButton.addEventListener("click", Screenshot.create);

  resizeButton.addEventListener("click", toggleResizePanel);

  controlsEl.style.display = "block";
}