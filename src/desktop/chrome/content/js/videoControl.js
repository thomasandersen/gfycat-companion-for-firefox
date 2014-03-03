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

  screenshotButtonEl.addEventListener("click", Screenshot.create);

  controlsEl.style.display = "block";
}