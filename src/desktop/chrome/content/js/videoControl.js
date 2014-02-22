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
  videoEl.mozRequestFullScreen();
}

function onDecreaseSpeed() {
  var videoEl = getVideoEl();
  videoEl.play();
  if (videoEl.playbackRate > 0.1) {
    videoEl.playbackRate -= 0.1;
  }
}

function onIncreaseSpeed() {
  var videoEl = getVideoEl();
  videoEl.play();
  if (videoEl.playbackRate < 5) {
    videoEl.playbackRate += 0.1;
  }
}

function onPreviousFrame(json) {
  var videoEl = getVideoEl();
  videoEl.pause();
  var prevFrame = videoEl.currentTime - (json.frameRate / 100);
  videoEl.currentTime = prevFrame;
}

function onNextFrame(json) {
  var videoEl = getVideoEl();
  videoEl.pause();
  var nextFrame = videoEl.currentTime + (json.frameRate / 100);
  videoEl.currentTime = nextFrame;
}

function onCaptureScreenshot() {
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
    revealScreenshotBarForTheFirstTime();
  }
}

function revealScreenshotBarForTheFirstTime() {
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

function initVideoControls(json) {
  var controlsEl = getControlsEl();
  var videoEl = getVideoEl();
  var playPauseButton = getPlayPauseButtonEl();
  var fullscreenButton = getFullscreenButtonEl();
  var increaseSpeedButton = getIncreaseSpeedButtonEl();
  var decreaseSpeedButton = getDecreaseSpeedButtonEl();
  var nextFrameButton = getNextFrameButtonEl();
  var previousFrameButton = getPreviousFrameButtonEl();
  var screenshotButtonEl = getScreenshotButtonEl();

  videoEl.addEventListener("play", function() {
    playPauseButton.classList.add("fa-pause");
    playPauseButton.classList.remove("fa-play");
  });

  videoEl.addEventListener("pause", function() {
    playPauseButton.classList.add("fa-play");
    playPauseButton.classList.remove("fa-pause");
  });

  playPauseButton.addEventListener("click", onPlayPause);

  fullscreenButton.addEventListener("click", onFullScreen);

  decreaseSpeedButton.addEventListener("click", onDecreaseSpeed);

  increaseSpeedButton.addEventListener("click", onIncreaseSpeed);

  previousFrameButton.addEventListener("click", function() {
    onPreviousFrame(json);
  });

  nextFrameButton.addEventListener("click", function() {
    onNextFrame(json);
  });

  screenshotButtonEl.addEventListener("click", onCaptureScreenshot);

  controlsEl.style.display = "block";
}