let { Cc, Ci } = require("chrome");
let data = require("sdk/self").data;
let prefs = require("sdk/simple-prefs").prefs;
let systemEvents = require("sdk/system/events");
let clipboard = require("sdk/clipboard");
let windowUtils = require("sdk/window/utils");
let tabs = require("sdk/tabs");
let cm = require("sdk/context-menu");

const GFYCAT_URL = "http://gfycat.com/fetch/";

function isChannelInitialDocument(httpChannel) {
  return httpChannel.loadFlags & httpChannel.LOAD_INITIAL_DOCUMENT_URI;
}

function getWindowForRequest(request){
  if (request instanceof Ci.nsIRequest) {
    try {
      if (request.notificationCallbacks) {
        return request.notificationCallbacks.getInterface(Ci.nsILoadContext).associatedWindow;
      }
    } catch(e) {
    }
    try {
      if (request.loadGroup && request.loadGroup.notificationCallbacks) {
        return request.loadGroup.notificationCallbacks.getInterface(Ci.nsILoadContext).associatedWindow;
      }
    } catch(e) {
    }
  }
  return null;
}

function httpResponseListener(event) {
  if (!prefs.redirectGifResponses) {
    return;
  }
  let channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
  if (isChannelInitialDocument(channel) && /gif/.test(channel.getResponseHeader("Content-Type"))) {
    channel.cancel(Cc.NS_BINDING_ABORTED);
    let url = event.subject.URI.spec;
    let gBrowser = windowUtils.getMostRecentBrowserWindow().gBrowser;
    let domWin = getWindowForRequest(event.subject);
    let browser = gBrowser.getBrowserForDocument(domWin.top.document);
    browser.loadURI(GFYCAT_URL + url);
  }
}
systemEvents.on("http-on-examine-response", httpResponseListener);
systemEvents.on("http-on-examine-cached-response", httpResponseListener);

cm.Item({
  label: "Open with gfycat",
  context: cm.SelectorContext("img"),
  contentScriptFile: data.url("context-menu-click.js"),
  onMessage: function (src) {
    tabs.open(GFYCAT_URL + src);
  }
});

cm.Item({
  label: "Copy as gfycat URL",
  context: cm.SelectorContext("img"),
  contentScriptFile: data.url("context-menu-click.js"),
  onMessage: function (src) {
    clipboard.set(GFYCAT_URL + src);
  }
});