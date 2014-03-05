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
  simulateInputEvent: simulateInputEvent
};

exports.createMouseEvent = (mouseEventType, doc) => {
  return createMouseEvent(mouseEventType, doc);
};

exports.simulateContextClick = (node) => {
  return contextClick(node);
};

exports.loadPage = (url, ...args) => {
  return loadPage(url, args);
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
  let mouseEvent = node.ownerDocument.createEvent("MouseEvents");
  
  mouseEvent.initMouseEvent(eventType, true, true, node.defaultView, 1,
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

function loadPage(url, args) {
  let deferred = promise.defer();
  
  tabs.once("ready", () => {
    deferred.resolve(args[0]);
  });

  let allTabs = tabUtil.getTabs(windowUtil.getMostRecentBrowserWindow());
  let contentWindow = tabUtil.getTabContentWindow(allTabs[0]);
  contentWindow.location.href = url;

  return deferred.promise;
}