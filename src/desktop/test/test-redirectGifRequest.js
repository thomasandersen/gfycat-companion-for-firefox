let system = require("sdk/system");
let { Cc, Ci, Cu } = require("chrome");
let promise = require("sdk/core/promise");
let windowUtil = require("sdk/window/utils");
let tabs = require("sdk/tabs");
let tabUtil = require("sdk/tabs/utils");
let clipboard = require("sdk/clipboard");
let main = require("./main");
let { wait, context } = require("./lib/testUtil");
let helper = require("./helper");

let testPage = "http://mr-andersen.no/gfcycat-companion-test/index.html";

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

exports["test browser should redirect to gfycat service when a gif is directly requested"] = function(assert, done) {
  helper.loadTestPage(assert)
  .then(test_gifRequestShouldBeRedirectedToGfycat)
  .then(done);
};

function test_gifRequestShouldBeRedirectedToGfycat(assert) {
  let deferred = promise.defer();
  helper.getAnchorNode().click();

  // Wait for response from gfycat service.
  wait(10000).then(() => {
    assert.ok(tabs.activeTab.url.startsWith("http://gfycat.com/"), "gif request should be redirected to gfycat");
    deferred.resolve(assert);
  }, 10000);
  return deferred.promise;
}

require("sdk/test").run(exports);
