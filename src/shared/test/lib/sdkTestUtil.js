let promise = require("sdk/core/promise");
let timers = require("sdk/timers");
let windowUtil = require("sdk/window/utils");
let tabUtil = require("sdk/tabs/utils");
let tabs = require("sdk/tabs");

exports.wait = (ms) => {
  return wait(ms);
};

exports.context = {
  getWindow: getPageWindow,
  getDocument: getPageDocument,
  simulateMouseEvent: simulateMouseEvent,
  simulateChangeEvent: simulateChangeEvent,
  simulateInputEvent: simulateInputEvent,
  clickAnchor: clickAnchor
};

exports.createMouseEvent = (mouseEventType, doc) => {
  return createMouseEvent(mouseEventType, doc);
};

exports.simulateContextClick = (node) => {
  return contextClick(node);
};

exports.loadPage = (url, assert) => {
  return loadPage(url, assert);
};

exports.waitForElement = (cssSelector) => {
  return waitForElement(cssSelector);
};

function getPageWindow() {
  let tabElement = tabUtil.getActiveTab(windowUtil.getMostRecentBrowserWindow());
  let win = tabUtil.getTabContentWindow(tabElement);
  return win;
}

function getPageDocument() {
  return getPageWindow().document;
}

function querySelector(cssSelector) {
  return getPageDocument().querySelector(cssSelector);
}

function simulateMouseEvent(eventType, node) {
  let mouseEvent = node.ownerDocument.createEvent("MouseEvent");
  mouseEvent.initMouseEvent(eventType, true, true, getPageWindow(), 1,
  0, 0, 0, 0,
  false, false, false, false, 2, null);

  node.dispatchEvent(mouseEvent);
}

function simulateChangeEvent(node, value) {
  node.setAttribute("value", value);
  let htmlEvents = node.ownerDocument.createEvent("HTMLEvents");
  htmlEvents.initEvent("change", false, true);
  node.dispatchEvent(htmlEvents);
}

function simulateInputEvent(node, value) {
  node.setAttribute("value", value);
  let htmlEvents = node.ownerDocument.createEvent("HTMLEvents");
  htmlEvents.initEvent("input", false, true);
  node.dispatchEvent(htmlEvents);
}

function clickAnchor(anchorNode) {
  anchorNode.click();
}

function wait(ms) {
  let deferred = promise.defer();
  timers.setTimeout(() => {
    deferred.resolve();
  }, ms);
  return deferred.promise;
}

function waitForElement(cssSelector) {
  let deferred = promise.defer();
  let maxTicks = 300;
  let tick = 0;

  let element = querySelector(cssSelector);
  let intervalID = timers.setInterval(() => {
    if (element != null) {
      timers.clearInterval(intervalID);
      deferred.resolve(element);
    }
    if (tick == maxTicks) {
      timers.clearInterval(intervalID);
      deferred.resolve();
    }
    element = querySelector(cssSelector);
    tick++;
  }, 300);

  return deferred.promise;
}

function loadPage(url, assert) {
  let deferred = promise.defer();

  tabs.once("ready", () => {
    deferred.resolve(assert);
  });

  let allTabs = tabUtil.getTabs(windowUtil.getMostRecentBrowserWindow());
  let contentWindow = tabUtil.getTabContentWindow(allTabs[0]);
  contentWindow.location.href = url;

  return deferred.promise;
}