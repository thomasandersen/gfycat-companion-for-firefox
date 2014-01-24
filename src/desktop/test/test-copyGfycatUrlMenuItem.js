let promise = require("sdk/core/promise");
let windowUtil = require("sdk/window/utils");
let tabs = require("sdk/tabs");
let tabUtil = require("sdk/tabs/utils");
let clipboard = require("sdk/clipboard");
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
    let menuItem = contextMenu.querySelector("menuitem[value='gccfx-menuItemCopyAsGfycatUrl']");
    
    assert.equal(menuItem.hidden, false, "'Copy as gfycat' menuitem is displayed");

    menuItem.doCommand();
    // Wait for clipboard
    wait(300).then(() => {
      assert.equal(clipboard.get(), "http://gfycat.com/fetch/http://awegif.com/gifs/1963.gif",
       "Clipboard has the correct url.");

      deferred.resolve(assert);
    });

    contextMenu.hidePopup();

  });

  return deferred.promise;
}

require("sdk/test").run(exports);
