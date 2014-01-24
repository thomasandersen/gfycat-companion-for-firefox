let system = require("sdk/system");
let { Cc, Ci, Cu } = require("chrome");
let promise = require("sdk/core/promise");
let windowUtil = require("sdk/window/utils");
let tabs = require("sdk/tabs");
let tabUtil = require("sdk/tabs/utils");
let clipboard = require("sdk/clipboard");
let main = require("./main");
let { wait, context } = require("./lib/sdkTestUtil");

let testPage = "http://mr-andersen.no/gfcycat-companion-test/index.html";

exports.loadTestPage = loadTestPage;
exports.getAnchorNode = getAnchorNode;
exports.getImageNode = getImageNode;
exports.getContentAreaContextMenu = getContentAreaContextMenu;

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

function getAnchorNode() {
  let doc = context.getDocument();
  return doc.querySelector("#gif-link");
}

function getImageNode() {
  let doc = context.getDocument();
  return getAnchorNode().querySelector("img");
}

function getContentAreaContextMenu() {
  return windowUtil.getMostRecentBrowserWindow().document.querySelector("#contentAreaContextMenu");
}
