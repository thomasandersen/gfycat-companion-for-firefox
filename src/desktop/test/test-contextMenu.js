let system = require("sdk/system");
let promise = require("sdk/core/promise");
let windowUtil = require("sdk/window/utils");
let tabs = require("sdk/tabs");
let tabUtil = require("sdk/tabs/utils");
let clipboard = require("sdk/clipboard");
let main = require("./main");
let { wait, context } = require("./lib/testUtil");
let helper = require("./helper");

exports["test context menu should only have *copy as gfycat url* menu item when comtext clicking an anchor node"] = function(assert, done) {
  helper.loadTestPage(assert)
  .then(() => {
    let deferred = promise.defer();
    test_contextMenuOnAnchorNode(assert, deferred);
    return deferred.promise;
  })
  .then(done);
};

exports["test context menu should have *open with gfycat* and *copy as gfycat url*  menu items when comtext clicking an image[src=gif] node"] = function(assert, done) {
  helper.loadTestPage(assert)
  .then(() => {
    let deferred = promise.defer();
    test_contextMenuOnImageNode(assert, deferred);
    return deferred.promise;
  })
  .then(done);
};

exports["test Copy as gfycat URL context menu item"] = function(assert, done) {
  helper.loadTestPage(assert)
  .then(() => {
    let deferred = promise.defer();
    test_copyGfyCatUrlMenuItem(assert, deferred);
    return deferred.promise;
  })
  .then(done);
};

exports["test Upload to gfycat context menu item"] = function(assert, done) {
  helper.loadTestPage(assert)
  .then(() => {
    let deferred = promise.defer();
    test_uploadToGfyCatMenuItem(assert, deferred);
    return deferred.promise;
  })
  .then(done);
};

function test_contextMenuOnAnchorNode(assert, deferred) {
  // Context click the node
  context.simulateMouseEvent("contextmenu", helper.getAnchorNode());
  // Wait for context menu
  wait(300).then(() => {
    let contextMenu = helper.getContentAreaContextMenu();

    assert.equal(helper.getOpenWithGfyCatMenuItem(contextMenu).hidden, true, "*open with gfycat* menu item should be hidden");
    assert.equal(helper.getCopyAsGfyCatUrlMenuItem(contextMenu).hidden, false, "*copy as gfycat url* menu item should be visible");
    
    contextMenu.hidePopup();
    deferred.resolve(assert);
  });

  return deferred.promise;
}

function test_contextMenuOnImageNode(assert, deferred) {
  // Context click the node
  context.simulateMouseEvent("contextmenu", helper.getImageNode());

  // Wait for context menu
  wait(300).then(() => {
    let contextMenu = helper.getContentAreaContextMenu();

    assert.equal(helper.getOpenWithGfyCatMenuItem(contextMenu).hidden, false, "*Open with gfycat* menu item should be visible");
    assert.equal(helper.getCopyAsGfyCatUrlMenuItem(contextMenu).hidden, false, "*copy as gfycat url* menu item should be visible");
    
    contextMenu.hidePopup();
    deferred.resolve(assert);
  });

  return deferred.promise;
}


function test_copyGfyCatUrlMenuItem(assert, deferred) {
  // Context click the node
  context.simulateMouseEvent("contextmenu", helper.getImageNode());

  // Wait for context menu
  wait(500).then(() => {
    let contextMenu = helper.getContentAreaContextMenu();
    let menuItem = helper.getCopyAsGfyCatUrlMenuItem(contextMenu);

    assert.ok(!menuItem.hidded, "Copy as gfycat menu item is shown");

    // Execute menu item's command
    menuItem.doCommand();

    // Wait for clipboard
    wait(300).then(() => {
      assert.ok(clipboard.get().contains("http://gfycat.com/fetch/"), "clipbard should contain gfycat endpoint");
      assert.ok(clipboard.get().contains("1963.gif"), "clipbard should contain gif file");
      deferred.resolve(assert);
    });

    contextMenu.hidePopup();

  });

  return deferred.promise;
}

function test_uploadToGfyCatMenuItem(assert, deferred) {
  // Context click the node
  context.simulateMouseEvent("contextmenu", helper.getImageNode());

  // Wait for context menu
  wait(500).then(() => {
    let contextMenu = helper.getContentAreaContextMenu();
    let menuItem = helper.getOpenWithGfyCatMenuItem(contextMenu);

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

require("sdk/test").run(exports);
