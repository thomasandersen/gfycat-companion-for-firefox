let promise = require("sdk/core/promise");
let windowUtil = require("sdk/window/utils");
let tabUtil = require("sdk/tabs/utils");
let main = require("./main");
let common = require("./common");
let { wait, context, loadPage } = require("./lib/sdkTestUtil");

exports["test click menu item"] = function(assert, done) {
  loadPage("http://mr-andersen.no/gfcycat-companion-test/index.html", assert)
  .then(test_clickMenuItem)
  .then(done);
};

function test_clickMenuItem(assert) {
  let deferred = promise.defer();

  context.simulateMouseEvent("contextmenu", common.getImageNode());
  
  // Wait for context menu
  wait(500).then(() => {
    let contextMenu = common.getContentAreaContextMenu();
    let menuItem = contextMenu.querySelector("menuitem[value='gccfx-openWithGfyCat']");

    assert.equal(menuItem.hidden, false, "'Upload to gfycat' menuitem is displayed");

    menuItem.doCommand();
    // Wait for response from gfycat
    wait(7000).then(() => {
      let browserWindow = windowUtil.getMostRecentBrowserWindow();
      let allTabs = tabUtil.getTabs(browserWindow);
      let tab = allTabs[allTabs.length-1];
      let contentWindow = tabUtil.getTabContentWindow(tab);

      assert.ok(contentWindow.location.href.startsWith("http://gfycat.com"), "Clicking Upload to gfycat menu item should open new tab to gfycat service");

      browserWindow.gBrowser.removeTab(tab);
      deferred.resolve(assert);
    });

    contextMenu.hidePopup();
  });

  return deferred.promise;
}

require("sdk/test").run(exports);
