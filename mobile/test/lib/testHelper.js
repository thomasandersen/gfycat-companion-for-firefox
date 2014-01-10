let promise = require("sdk/core/promise");
let timers = require("sdk/timers");
let windowUtil = require("sdk/window/utils");
let tabUtil = require("sdk/tabs/utils");

exports.wait = (ms) => {
  return wait(ms);
};

exports.context = {
  getWindow: getPageWindow,
  getDocument: getPageDocument,
  simulateMouseEvent: simulateMouseEvent
};

exports.createMouseEvent = (mouseEventType, doc) => {
  return createMouseEvent(mouseEventType, doc);
};

exports.simulateContextClick = (node) => {
  return contextClick(node);
};

function wait(ms) {
  let deferred = promise.defer();
  timers.setTimeout(() => {
    deferred.resolve();
  }, ms);
  return deferred.promise;
}

function getPageWindow() {
  let tabElement = tabUtil.getActiveTab(windowUtil.getMostRecentBrowserWindow());
  let win = tabUtil.getTabContentWindow(tabElement);
  return win;
}

function getPageDocument() {
  return getPageWindow().document;
}

function simulateMouseEvent(eventType, node) {
  let mouseEvent = node.ownerDocument.createEvent("MouseEvents");
  
  mouseEvent.initMouseEvent(eventType, true, true, node.defaultView, 1,
  0, 0, 0, 0,
  false, false, false, false, 2, null);

  node.dispatchEvent(mouseEvent);
}