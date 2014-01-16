let system = require("sdk/system");
let { Cc, Ci, Cu } = require("chrome");
let promise = require("sdk/core/promise");
let windowUtil = require("sdk/window/utils");
let tabs = require("sdk/tabs");
let tabUtil = require("sdk/tabs/utils");
let clipboard = require("sdk/clipboard");
let main = require("./main");
let { wait, context } = require("./lib/testUtil");

let testPage = "http://www.reddit.com/r/gifs/comments/1ugfm4/almost_done_hhdyduzhakdufhhe/";

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

exports["test RES image viewer mod"] = function(assert, done) {
  loadTestPage(assert)
  .then(() => {
    let deferred = promise.defer();
    test_onResImageViewerExpand(assert, deferred);
    return deferred.promise;
  })
  .then(() => {
    let deferred = promise.defer();
    test_onResImageViewerCollapse(assert, deferred);
    return deferred.promise;
  })
  .then(done);
};

function test_onResImageViewerExpand(assert, deferred) {
  let pageDocument = context.getDocument();

  context.simulateMouseEvent("click", getToggleImageButton());

  // Wait for video to load.
  wait(10000).then(() => {
    let video = pageDocument.querySelector(".gccfx-video");
    let videoResizer = pageDocument.querySelector(".gccfx-video-size-slider");
    let gifImageAnchor = pageDocument.querySelector(".toggleImage ~ .madeVisible a.madeVisible");
    let gifImageAnchorDisplay = context.getWindow().getComputedStyle(gifImageAnchor).display;
    let loaderBar = pageDocument.querySelector(".gccfx-loader-bar");
    let messageNode = pageDocument.querySelector(".gccfx-message");

    assert.ok(video != null, "The video node should exist.");

    assert.ok(videoResizer != null, "The video resizer node should exist.");

    context.simulateChangeEvent(videoResizer, "614");

    assert.equal(video.getAttribute("width"), "614", "After changing resizer value the video should be resized.");

    assert.ok(gifImageAnchorDisplay == "none", "The anchor for the original image should now be hidden.");

    assert.ok(loaderBar == null, "The loader bar node should now have been removed.");
    
    assert.ok(messageNode != null, "The message node should exist.");

    deferred.resolve(assert);
  }); 
}

function test_onResImageViewerCollapse(assert, deferred) {
  let pageDocument = context.getDocument();

  context.simulateMouseEvent("click", getToggleImageButton());

  // Wait for element to collapse.
  wait(500).then(() => {
    let video = pageDocument.querySelector(".gccfx-video");
    let videoResizer = pageDocument.querySelector(".gccfx-video-size-slider");
    let gifImageAnchor = pageDocument.querySelector(".toggleImage ~ .madeVisible a.madeVisible");
    let gifImageAnchorDisplay = context.getWindow().getComputedStyle(gifImageAnchor).display;
    let loaderBar = pageDocument.querySelector(".gccfx-loader-bar");
    let messageNode = pageDocument.querySelector(".gccfx-message");
    
    assert.ok(video == null, "The video node should not exist");
    
    assert.ok(videoResizer == null, "The video resizer should not exist");

    assert.ok(gifImageAnchorDisplay == "inline-block", "The original image should now be visible.");

    assert.ok(loaderBar == null, "The loading info node should not exist.");

    assert.ok(messageNode == null, "The message node should not exist.");

    deferred.resolve(assert);
  }); 

}

// ------------------------------------------------------------------------------
// Helper functions
// ------------------------------------------------------------------------------

function loadTestPage(assert) {
  let deferred = promise.defer();
  let allTabs = tabUtil.getTabs(windowUtil.getMostRecentBrowserWindow());
  let contentWindow = tabUtil.getTabContentWindow(allTabs[0]);

  contentWindow.location.href = testPage;

  wait(5000).then(() => {
    deferred.resolve(assert);
  });
  return deferred.promise;
}

function getToggleImageButton() {
  let pageDocument = context.getDocument();
  return pageDocument.querySelector(".toggleImage");
}

require("sdk/test").run(exports);
