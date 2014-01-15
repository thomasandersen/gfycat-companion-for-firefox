let { Cc, Ci, Cr } = require("chrome");
let system = require("sdk/system");
let systemEvents = require("sdk/system/events");
let windowUtils = require("sdk/window/utils");
let Request = require("sdk/request").Request;
let properties = require("packages/properties");
let urlHelper = require("packages/urlHelper");

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

    let isGifCallback = () => {
      redirect(request, (properties.gfycat.fetchEndpoint + request.URI.spec));
    };

    let isGNotifCallback = () => {
      redirect(request, urlHelper.addParameterToUrl("gccfxDoRequest", "1", request.URI.spec));
    };

    // Check if image is a gif by doing a head request.
    urlHelper.isGifContentType(url, isGifCallback, isGNotifCallback);
  }
}
