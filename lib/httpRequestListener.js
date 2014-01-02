let { Cc, Ci } = require("chrome");
let properties = require("./properties");
let systemEvents = require("sdk/system/events");
let windowUtils = require("sdk/window/utils");

exports.enable = (enable) => {
  return doEnable(enable);
}

function doEnable(enable) {
  if (enable) {
    systemEvents.on("http-on-modify-request", listener);
  } else {
    systemEvents.off("http-on-modify-request", listener);
  }
}

function isChannelInitialDocument(httpChannel) {
  return httpChannel.loadFlags & httpChannel.LOAD_INITIAL_DOCUMENT_URI;
}

function getWindowForRequest(request){
  if (request instanceof Ci.nsIRequest) {
    try {
      if (request.notificationCallbacks) {
        return request.notificationCallbacks
              .getInterface(Ci.nsILoadContext).associatedWindow;
      }
    } catch(e) {
    }
    try {
      if (request.loadGroup && request.loadGroup.notificationCallbacks) {
        return request.loadGroup.notificationCallbacks
              .getInterface(Ci.nsILoadContext).associatedWindow;
      }
    } catch(e) {
    }
  }
  return null;
}

function reditectToGfyCat(request) {
  let gBrowser = windowUtils.getMostRecentBrowserWindow().gBrowser;
  let domWin = getWindowForRequest(request);
  let browser = gBrowser.getBrowserForDocument(domWin.top.document);
  browser.loadURI(properties.gfycat.fetchEndpoint + request.URI.spec);

}

function listener(event) {
  let channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
  let url = event.subject.URI.spec;
  if (url.startsWith(properties.gfycat.fetchEndpoint)) {
    return;
  }
  if (isChannelInitialDocument(channel) && url.endsWith(".gif")) {
    channel.cancel(Cc.NS_BINDING_ABORTED);
    reditectToGfyCat(event.subject);
  }
}
