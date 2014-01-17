let promise = require("sdk/core/promise");
let windowUtil = require("sdk/window/utils");
let tabs = require("sdk/tabs");
let tabUtil = require("sdk/tabs/utils");
let clipboard = require("sdk/clipboard");
let main = require("./main");
let { wait, context } = require("./lib/testUtil");
let helper = require("./helper");

exports["test click menu item"] = function(assert, done) {
  helper.loadTestPage(assert)
  .then(() => {
    let deferred = promise.defer();
    test_clickMenuItem(assert, deferred);
    return deferred.promise;
  })
  .then(done);
};

function test_clickMenuItem(assert, deferred) {
  // Context click the node
  context.simulateMouseEvent("contextmenu", helper.getImageNode());

  // Wait for context menu
  wait(500).then(() => {
    let contextMenu = helper.getContentAreaContextMenu();
    let menuItem = helper.getCopyAsGfyCatUrlMenuItem(contextMenu);

    assert.equal(menuItem.hidden, false, "Copy as gfycat menu item is shown");

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

require("sdk/test").run(exports);
