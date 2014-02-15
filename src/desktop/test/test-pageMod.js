let promise = require("sdk/core/promise");
let main = require("./main");
let { wait, context, loadPage, waitForElement } = require("./lib/sdkTestUtil");

exports["test RES image viewer mod"] = function(assert, done) {
  loadPage("http://www.reddit.com/r/gifs/comments/1ugfm4/almost_done_hhdyduzhakdufhhe/", assert)
  .then(test_onResImageViewerExpand)
  .then(test_onResImageViewerCollapse)
  .then(done);
};

function test_onResImageViewerExpand(assert) {
  let deferred = promise.defer();

  waitForElement(".toggleImage")
  .then((toggleButtonElement) => {
    context.simulateMouseEvent("click", toggleButtonElement);
    waitForElement(".gccfx-video").then(() => {
      let pageDocument = context.getDocument();
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
  });

  return deferred.promise;
}

function test_onResImageViewerCollapse(assert) {
  let deferred = promise.defer();

  context.simulateMouseEvent("click", context.getDocument().querySelector(".toggleImage"));

  // Wait for element to collapse.
  wait(500).then(() => {
    let pageDocument = context.getDocument();
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

  return deferred.promise;
}

function getRedditToggleImageButton() {
  let pageDocument = context.getDocument();
  return pageDocument.querySelector(".toggleImage");
}

require("sdk/test").run(exports);
