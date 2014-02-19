function onPlayPause() {
  var playPauseButton = getPlayPauseButtonEl();
  var videoEl = getVideoEl();
  var paused = videoEl.paused;
  if (paused) {
    playPauseButton.classList.add("fa-pause");
    playPauseButton.classList.remove("fa-play");
    videoEl.play();
  } else {
    playPauseButton.classList.add("fa-play");
    playPauseButton.classList.remove("fa-pause");
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
  var canvasEl = getScreenshotCanvasEl();
  var container = getScreenshotCanvasContainerEl();
  var w = videoEl.videoWidth;
  var h = videoEl.videoHeight;

  canvasEl.width  = w;
  canvasEl.height = h;

  var context = canvasEl.getContext("2d");
  context.drawImage(videoEl, 0, 0, w, h);

  container.style.display = "block";
}

function onDownloadScreenshot() {
  var link = document.createElement("a");
  link.href = getScreenshotCanvasEl().toDataURL();
  link.download = "screenshot.png";
  link.style.display = "none";
  document.body.appendChild(link);
  var e = document.createEvent("MouseEvents");
  e.initEvent("click" ,true ,true);
  link.dispatchEvent(e);
  document.body.removeChild(link);
  return true;
}

function closeScreenshot() {
  getScreenshotCanvasContainerEl().style.display = "none";
}

function updateControls(json) {
  var controlsEl = getControlsEl();
  var videoEl = getVideoEl();
  var playPauseButton = getPlayPauseButtonEl();
  var fullscreenButton = getFullscreenButtonEl();
  var increaseSpeedButton = getIncreaseSpeedButtonEl();
  var decreaseSpeedButton = getDecreaseSpeedButtonEl();
  var nextFrameButton = getNextFrameButtonEl();
  var previousFrameButton = getPreviousFrameButtonEl();
  var screenshotButtonEl = getScreenshotButtonEl();

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

  getScreenshotCloseButtonEl().addEventListener("click", closeScreenshot);

  getScreenshotDownloadButtonEl().addEventListener("click", onDownloadScreenshot);

  controlsEl.style.display = "block";
}