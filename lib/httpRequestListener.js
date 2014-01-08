let { Cc, Ci, Cr } = require("chrome");
let properties = require("./properties");
let systemEvents = require("sdk/system/events");
let windowUtils = require("sdk/window/utils");
let urlHelper = require("./urlHelper");

exports.enable = (enable) => {
  return doEnable(enable);
}

function doEnable(enable) {
  if (enable) {
    systemEvents.on("http-on-modify-request", requestListener);
  } else {
    systemEvents.off("http-on-modify-request", requestListener);
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

function requestListener(event) {
  let request = event.subject;
  let channel = request.QueryInterface(Ci.nsIHttpChannel);

  let url = request.URI.spec;

  // Make sure redirects don't recurse.
  if (url.contains(properties.gfycat.domain)) {
    return;
  }

  // Make sure flagged gifs falls through (see data/scripts/resImageViewerMod).
  if (url.contains("gccfxDoRequest=1")) {
    return;
  }

  let isInitialDocument = isChannelInitialDocument(channel);
  let isGif = urlHelper.urlEndsWithDotGif(url);

  console.log("isGif", isGif);

  // Redirect direct gif requests.
  if (isInitialDocument && isGif) {
    console.log("direct request");
    channel.cancel(Cr.NS_BINDING_ABORTED);
    reditectToGfyCat(request);
  }

  let isRequestedByReddit = request.referrer && request.referrer.host == "www.reddit.com";

  // Cancel inline requests to gif hosting services.
  if (isGif && isRequestedByReddit) {
    let domain = urlHelper.getDomain(request.URI.host);
    if (!isInitialDocument && properties.gifHostingServices.indexOf(domain) > -1) {
      console.log("cancel request to " + domain + " gif", channel.notificationCallbacks);
      channel.cancel(Cr.NS_BINDING_ABORTED);
    }
  }

}
