let promise = require("sdk/core/promise");
let windowUtil = require("sdk/window/utils");
let tabUtil = require("sdk/tabs/utils");
let main = require("./main");
let { wait, context } = require("./lib/testUtil");
let helper = require("./helper");

exports["test click menu item"] = function(assert, done) {
  helper.loadTestPage(assert)
  .then(() => {
    let deferred = promise.defer();
    test_openWithGfycatMenuItem(assert, deferred);
    return deferred.promise;
  })
  .then(done);
};

function test_openWithGfycatMenuItem(assert, deferred) {
  // Context click the node
  context.simulateMouseEvent("contextmenu", helper.getImageNode());

  // Wait for context menu
  wait(500).then(() => {
    let contextMenu = helper.getContentAreaContextMenu();
    let menuItem = helper.getOpenWithGfyCatMenuItem(contextMenu);

    assert.equal(menuItem.hidden, false, "Upload to gfycat menu item is shown");

    // Execute menu item's command
    menuItem.doCommand();
    // Wait for response from gfycat
    wait(6000).then(() => {
      let browserWindow = windowUtil.getMostRecentBrowserWindow();
      let allTabs = tabUtil.getTabs(browserWindow);
      let tab = allTabs[allTabs.length-1];
      let contentWindow = tabUtil.getTabContentWindow(tab);
      
      assert.ok(contentWindow.location.href.startsWith("http://gfycat.com"), "Clicking Upload to gfycat menu item should open new tab to gfycat service");

      browserWindow.gBrowser.removeTab(tab);

      deferred.resolve(assert);
    }, 6000);

    contextMenu.hidePopup();
    
  }, 500);

  return deferred.promise;
}

require("sdk/test").run(exports);
