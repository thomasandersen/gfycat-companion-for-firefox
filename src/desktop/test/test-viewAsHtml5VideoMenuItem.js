let promise = require("sdk/core/promise");
let windowUtil = require("sdk/window/utils");
let tabUtil = require("sdk/tabs/utils");
let main = require("./main");
let { wait, context, loadPage } = require("./lib/sdkTestUtil");

exports["test click menu item"] = function(assert, done) {
  loadPage("http://mr-andersen.no/gfcycat-companion-test/index.html", assert)
  .then(test_clickMenuItem)
  .then(done);
};

function test_clickMenuItem(assert) {
  let deferred = promise.defer();

  context.simulateMouseEvent("contextmenu", getImageNode());
  
  // Wait for context menu
  wait(500).then(() => {
    let contextMenu = getContentAreaContextMenu();
    let menuItem = contextMenu.querySelector("menuitem[value='gccfx-viewAsHtml5Video']");

    assert.equal(menuItem.hidden, false, "'Upload to gfycat' menuitem is displayed");

    menuItem.doCommand();
    // Wait for response from gfycat
    wait(7000).then(() => {
      let browserWindow = windowUtil.getMostRecentBrowserWindow();
      let allTabs = tabUtil.getTabs(browserWindow);
      let tab = allTabs[allTabs.length-1];
      let contentWindow = tabUtil.getTabContentWindow(tab);

      assert.ok(contentWindow.location.href.startsWith("chrome://gfycat/content/video.html"), "Clicking 'View as HTML5 Video' menu item should open new tab to video page");

      browserWindow.gBrowser.removeTab(tab);
      deferred.resolve(assert);
    });

    contextMenu.hidePopup();
  });

  return deferred.promise;
}

function getContentAreaContextMenu() {
  return windowUtil.getMostRecentBrowserWindow().document.querySelector("#contentAreaContextMenu");
}

function getImageNode() {
  let doc = context.getDocument();
  return getAnchorNode().querySelector("img");
}

function getAnchorNode() {
  let doc = context.getDocument();
  return doc.querySelector("#gif-link");
}

require("sdk/test").run(exports);
