let system = require("sdk/system");
let { Cc, Ci, Cu } = require("chrome");
let promise = require("sdk/core/promise");
let windowUtil = require("sdk/window/utils");
let tabs = require("sdk/tabs");
let tabUtil = require("sdk/tabs/utils");
let clipboard = require("sdk/clipboard");
let main = require("./main");
let { wait, context } = require("./lib/testHelper");

let testPage = system.staticArgs.testPage;

if (!testPage) {
  dump("\nCould not run test.\n");
  dump("Test page not specified in --static-args\n");
  dump("cExample: cfx test -f addon -p ~/retire-profile --static-args='{\"testPage\":\"http://mr-andersen.no/gfcycat-companion-test/index.html\"}' \n\n");
  system.exit();
}

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

exports["test context menu should have two gfycat menu items when comtext clicking an anchor node"] = function(assert, done) {
  loadTestPage(assert)
  .then(() => {
    let deferred = promise.defer();
    test_contextMenuShouldHaveTwoMenuItemsWhenClickingNode(getAnchorNode(), assert, deferred);
    return deferred.promise;
  })
  .then(done);
};

exports["test context menu should have two gfycat menu items when comtext clicking an image node"] = function(assert, done) {
  loadTestPage(assert)
  .then(() => {
    let deferred = promise.defer();
    test_contextMenuShouldHaveTwoMenuItemsWhenClickingNode(getImageNode(), assert, deferred);
    return deferred.promise;
  })
  .then(done);
};

exports["test browser should redirect to gfycat service when a gif is directly requested"] = function(assert, done) {
  loadTestPage(assert)
  .then(test_gifRequestShouldBeRedirectedToGfycat)
  .then(done);
};

exports["test Copy as gfycat URL context menu item"] = function(assert, done) {
  loadTestPage(assert)
  .then(() => {
    let deferred = promise.defer();
    test_copyGfyCatUrlMenuItem(assert, deferred);
    return deferred.promise;
  })
  .then(done);
};

exports["test Upload to gfycat context menu item"] = function(assert, done) {
  loadTestPage(assert)
  .then(() => {
    let deferred = promise.defer();
    test_uploadToGfyCatMenuItem(assert, deferred);
    return deferred.promise;
  })
  .then(done);
};

function test_contextMenuShouldHaveTwoMenuItemsWhenClickingNode(node, assert, deferred) {
  // Context click the node
  context.simulateMouseEvent("contextmenu", node);
  // Wait for context menu
  wait(300).then(() => {
    let contextMenu = getContentAreaContextMenu();

    assert.ok(!getUploadToGfyCatMenuItem(contextMenu).hidded, "Upload to gfycat menu item is shown");
    assert.ok(!getCopyAsGfyCatUrlMenuItem(contextMenu).hidded, "Copy as gfycat menu item is shown");
    
    contextMenu.hidePopup();
    deferred.resolve(assert);
  });

  return deferred.promise;
}

function test_copyGfyCatUrlMenuItem(assert, deferred) {
  // Context click the node
  context.simulateMouseEvent("contextmenu", getImageNode());

  // Wait for context menu
  wait(500).then(() => {
    let contextMenu = getContentAreaContextMenu();
    let menuItem = getCopyAsGfyCatUrlMenuItem(contextMenu);

    assert.ok(!menuItem.hidded, "Copy as gfycat menu item is shown");

    // Execute menu item's command
    menuItem.doCommand();

    // Wait for clipboard
    wait(300).then(() => {
      assert.ok(clipboard.get().contains("http://gfycat.com/fetch/"), "clipbard should contain gfycat endpoint");
      assert.ok(clipboard.get().contains("zar3D1n.gif"), "clipbard should contain gif file");
      deferred.resolve(assert);
    });

    contextMenu.hidePopup();

  });

  return deferred.promise;
}

function test_uploadToGfyCatMenuItem(assert, deferred) {
  // Context click the node
  context.simulateMouseEvent("contextmenu", getImageNode());

  // Wait for context menu
  wait(500).then(() => {
    let contextMenu = getContentAreaContextMenu();
    let menuItem = getUploadToGfyCatMenuItem(contextMenu);

    assert.ok(!menuItem.hidded, "Upload to gfycat menu item is shown");

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

function test_gifRequestShouldBeRedirectedToGfycat(assert) {
  let deferred = promise.defer();
  getAnchorNode().click();

  // Wait for response from gfycat service.
  wait(10000).then(() => {
    assert.ok(tabs.activeTab.url.startsWith("http://gfycat.com/"), "gif request should be redirected to gfycat");
    deferred.resolve(assert);
  }, 10000);
  return deferred.promise;
}

// ------------------------------------------------------------------------------
// Helper functions
// ------------------------------------------------------------------------------

function loadTestPage(assert) {
  let deferred = promise.defer();
  let allTabs = tabUtil.getTabs(windowUtil.getMostRecentBrowserWindow());
  let contentWindow = tabUtil.getTabContentWindow(allTabs[0]);

  contentWindow.location.href = testPage;

  wait(4000).then(() => {
    deferred.resolve(assert);
  });
  return deferred.promise;
}

function getContentAreaContextMenu() {
  return windowUtil.getMostRecentBrowserWindow().document.querySelector("#contentAreaContextMenu");
}

function getUploadToGfyCatMenuItem(contextMenu) {
  return contextMenu.querySelector("menuitem[value='gccfx-openWithGfyCat']");
}

function getCopyAsGfyCatUrlMenuItem(contextMenu) {
  return contextMenu.querySelector("menuitem[value='gccfx-menuItemCopyAsGfycatUrl']");
}

function getAnchorNode() {
  let doc = context.getDocument();
  return doc.querySelector("#gif-link");
}

function getImageNode() {
  let doc = context.getDocument();
  return getAnchorNode().querySelector("img");
}


require("sdk/test").run(exports);
