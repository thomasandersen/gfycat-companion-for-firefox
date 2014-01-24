let promise = require("sdk/core/promise");
let tabs = require("sdk/tabs");
let main = require("./main");
let common = require("./common");
let { wait, context, loadPage } = require("./lib/sdkTestUtil");

exports["test browser should redirect to gfycat service when a gif is directly requested"] = function(assert, done) {
  loadPage("http://mr-andersen.no/gfcycat-companion-test/index.html", assert)
  .then(test_gifRequestShouldBeRedirectedToGfycat)
  .then(done);
};

function test_gifRequestShouldBeRedirectedToGfycat(assert) {
  let deferred = promise.defer();
  common.getAnchorNode().click();

  // Wait for response from gfycat service.
  wait(10000).then(() => {
    assert.ok(tabs.activeTab.url.startsWith("http://gfycat.com/"), "gif request should be redirected to gfycat");
    deferred.resolve(assert);
  }, 10000);
  return deferred.promise;
}

require("sdk/test").run(exports);
