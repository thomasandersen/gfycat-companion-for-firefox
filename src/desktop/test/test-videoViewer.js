let promise = require("sdk/core/promise");
let tabs = require("sdk/tabs");
let main = require("./main");
let { wait, context, loadPage } = require("./lib/sdkTestUtil");

exports["test browser should redirect to gfycat service when a gif is directly requested"] = function(assert, done) {
  loadPage("http://mr-andersen.no/gfcycat-companion-test/index.html", assert)
  .then(test_clickGifAndRedirect)
  .then(done);
};

function test_clickGifAndRedirect(assert) {
  let deferred = promise.defer();
  getAnchorThatLinksToTheImage().click();

  wait(5000).then(() => {
    assert.ok(tabs.activeTab.url.startsWith("chrome://gfycat/content/video.html"),
      "Direct gif request should be redirected to video viewer");

    let doc = context.getDocument();
    let win = context.getWindow();
    let videoElem = win.getVideoEl();
    let webmSourceElem = videoElem.querySelector("source[type='video/webm']");
    let mp4SourceElem = videoElem.querySelector("source[type='video/mp4']");
    let controlsElem = win.getControlsEl();
    let playPauseBtnElem = win.getPlayPauseButtonEl();
    let previousFrameBtnElem = win.getPreviousFrameButtonEl();
    let nextFrameBtnElem = win.getNextFrameButtonEl();
    let decreaseSpeedBtnElem = win.getDecreaseSpeedButtonEl();
    let increaseSpeedBtnElem = win.getIncreaseSpeedButtonEl();
    let fullscreenBtnElem = win.getFullscreenButtonEl();
    let resizeBtnElem = win.getResizeButtonEl();
    let screenShotBtnElem = win.getScreenshotButtonEl();

    assert.ok(videoElem != null,
      "The video element should exist.");
    assert.ok(webmSourceElem != null,
      "The video should have a source element of type video/webm.");
    assert.ok(mp4SourceElem != null,
      "The video should have a source element of type video/mp4.");

    assert.ok(controlsElem != null,
      "The video controls element should exist.");
    assert.ok(playPauseBtnElem != null,
      "The play/pause button should exist.");
    assert.ok(previousFrameBtnElem != null,
      "The video previous frame button should exist.");
    assert.ok(nextFrameBtnElem != null,
      "The next frame button should exist.");
    assert.ok(decreaseSpeedBtnElem != null,
      "The decrease speed button should exist.");
    assert.ok(increaseSpeedBtnElem != null,
      "The increase speed button should exist.");
    assert.ok(fullscreenBtnElem != null,
      "The fullscreen button should exist.");
    assert.ok(resizeBtnElem != null,
      "The resize button should exist.");
    assert.ok(screenShotBtnElem != null,
      "The screenshot button should exist.");

    playPauseBtnElem.click();
    assert.ok(videoElem.paused,
      "The video should be paused.");

    playPauseBtnElem.click();
    assert.ok(!videoElem.paused,
      "The video should be playing.");

    decreaseSpeedBtnElem.click();
    assert.ok(videoElem.playbackRate == 0.9,
      "The video playback rate should be decreased by 0.1");

    increaseSpeedBtnElem.click();
    assert.ok(videoElem.playbackRate == 1.0,
      "The video playback rate should be increased by 0.1");

    screenShotBtnElem.click();
    assert.ok(doc.querySelector("#screenshots-bar").style.display == "block",
      "The screenshots bar should be visible.");
    assert.ok(doc.querySelectorAll(".screenshot-canvas").length == 1,
      "There should be one screenshot.");

    deferred.resolve(assert);
  });
  return deferred.promise;
}

function getAnchorThatLinksToTheImage() {
  let doc = context.getDocument();
  return doc.querySelector("#gif-link");
}

require("sdk/test").run(exports);
