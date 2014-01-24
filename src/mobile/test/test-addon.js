let promise = require("sdk/core/promise");
let windowUtil = require("sdk/window/utils");
let tabs = require("sdk/tabs");
let tabUtil = require("sdk/tabs/utils");
let main = require("./main");
let { wait, context } = require("./lib/sdkTestUtil");

const TEST_GIF = "http://i.imgur.com/jqVmuPG.gif";

exports["test direct gif request should redirect to gfycat"] = function(assert, done) {
  loadTestPage(assert)
  .then(() => {
    let deferred = promise.defer();
    test_gifRequestShouldBeRedirectedToGfycat(assert);
    return deferred.promise;
  })
  .then(done);
};

function test_gifRequestShouldBeRedirectedToGfycat(assert) {
  let deferred = promise.defer();

  // Wait for response from gfycat service.
  wait(5000).then(() => {
    assert.ok(tabs.activeTab.url.startsWith("http://gfycat.com/"), "gif request should be redirected to gfycat");
    deferred.resolve(assert);
  });
  return deferred.promise;
}

function loadTestPage(assert) {
  let deferred = promise.defer();
  let allTabs = tabUtil.getTabs(windowUtil.getMostRecentBrowserWindow());
  let contentWindow = tabUtil.getTabContentWindow(allTabs[0]);

  let browserWindow = windowUtil.getMostRecentWindow();
  browserWindow.BrowserApp.loadURI(TEST_GIF);

  wait(4000).then(() => {
    deferred.resolve(assert);
  });
  return deferred.promise;
}

require("sdk/test").run(exports);
