let { Cc, Ci, Cr } = require("chrome");
let properties = require("./properties");
let system = require("sdk/system");
let systemEvents = require("sdk/system/events");
let windowUtils = require("sdk/window/utils");
let Request = require("sdk/request").Request;
let urlHelper = require("./urlHelper");

exports.enable = (enable) => {
  return doEnable(enable);
};

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

function redirect(request, redirectUrl) {
  let browserWindow = windowUtils.getMostRecentWindow();
  if (system.platform == "android") {
    browserWindow.BrowserApp.loadURI(redirectUrl);
  } else {
    let gBrowser = browserWindow.gBrowser;
    let domWin = getWindowForRequest(request);
    let browser = gBrowser.getBrowserForDocument(domWin.top.document);
    browser.loadURI(redirectUrl);
  }
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
  let isImage = urlHelper.isImage(url);

  // Redirect direct gif requests.
  if (isInitialDocument && isImage) {
    console.log("direct request");
    channel.cancel(Cr.NS_BINDING_ABORTED);

    // Check if image is a gif by doing a head request.
    // fixme: refactor and share with lib/resImageViewerModHelper
    // fixme: instead of reading the content-type we should try to read the file somehow.
    Request({
      url: url,
      onComplete: (response) => {

        let contentType = response.headers["Content-Type"];
        if (contentType.toLowerCase().contains("gif")) {
          console.log("is gif", response);
          //redirect(request, (properties.gfycat.fetchEndpoint + request.URI.spec));
        } else {
          //redirect(request, request.URI.spec);
        }
      }
    }).head();
    
  }

  // Make sure inline requests to gif hosting services requested by reddit.com is canceled.
  // RES image viewer will create a video request instead. 
  // fixme: should listen for preference: resImageViewerSupport
  let isGif = urlHelper.isGif(url);
  let isRequestedByReddit = request.referrer && request.referrer.host == "www.reddit.com";

  if (isGif && isRequestedByReddit) {

    // Must be one of the hosting services.
    let domain = urlHelper.getDomain(request.URI.host);
    if (!isInitialDocument && properties.gifHostingServices.indexOf(domain) > -1) {
      console.log("cancel request to " + domain + " gif");
      channel.cancel(Cr.NS_BINDING_ABORTED);
    }
  }

}
