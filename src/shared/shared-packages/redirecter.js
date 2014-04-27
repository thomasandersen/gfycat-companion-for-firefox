let { Cc, Ci, Cr } = require("chrome");
let system = require("sdk/system");
let systemEvents = require("sdk/system/events");
let windowUtils = require("sdk/window/utils");
let Request = require("sdk/request").Request;
let timers = require("sdk/timers");
let properties = require("packages/properties");
let urlHelper = require("packages/urlHelper");

var asyncHistory = Cc["@mozilla.org/browser/history;1"]
                  .getService(Ci.mozIAsyncHistory);

exports.enable = (enable) => {
  return doEnable(enable);
};

/**
 * Whether the redirecter should be enabled or not.
 *
 * @private
 * @param {boolean} aEnable
 */
function doEnable(aEnable) {
  if (aEnable) {
    systemEvents.on("http-on-modify-request", requestListener);
  } else {
    systemEvents.off("http-on-modify-request", requestListener);
  }
}

/**
 * Returns a number if the resource is the initial document.
 * Eg. index.html
 *
 * @private
 * @param {object} aHttpChannel
 * @returns {number}
 */
function isChannelInitialDocument(aHttpChannel) {
  return aHttpChannel.loadFlags & aHttpChannel.LOAD_INITIAL_DOCUMENT_URI;
}

/**
 * @private
 * @param {object} aRequest
 * @returns {object}
 */
function getWindowForRequest(aRequest){
  if (aRequest instanceof Ci.nsIRequest) {
    try {
      if (aRequest.notificationCallbacks) {
        return aRequest.notificationCallbacks
              .getInterface(Ci.nsILoadContext).associatedWindow;
      }
    } catch(e) {
    }
    try {
      if (aRequest.loadGroup && aRequest.loadGroup.notificationCallbacks) {
        return aRequest.loadGroup.notificationCallbacks
              .getInterface(Ci.nsILoadContext).associatedWindow;
      }
    } catch(e) {
    }
  }
  return null;
}

/**
 * @private
 * @param {object} request
 * @param {string} url
 */
function redirectRequest(request, url) {
  let browserWindow = windowUtils.getMostRecentBrowserWindow();
  if (system.platform == "android") {
    browserWindow.BrowserApp.loadURI(url);
  } else {
    let gBrowser = browserWindow.gBrowser;
    let domWin = getWindowForRequest(request);
    let browser = gBrowser.getBrowserForDocument(domWin.top.document);
    browser.loadURI(url);
  }
}

/**
 * Called for each request.
 * 
 * @private
 * @param {Event} aEvent
 */
function requestListener(aEvent) {
  let request = aEvent.subject;
  let channel = request.QueryInterface(Ci.nsIHttpChannel);
  let url = request.URI.spec;

  // Do not modify requests to gfycat.
  if (url.contains(properties.gfycat.domain)) {
    return;
  }

  // Make sure flagged gifs falls through (see data/scripts/resImageViewerMod).
  if (url.contains("gccfxDoRequest=1")) {
    return;
  }

  let isInitialDocument = isChannelInitialDocument(channel);
  let isImageFileExtension = urlHelper.isImageFileExtension(url);

  // Redirect direct gif requests.
  if (isInitialDocument && isImageFileExtension) {
    console.log("Is direct request");

    // Cancel the request.
    channel.cancel(Cr.NS_BINDING_ABORTED);

    // Check if content type is gif/image and redirect.

    let isGifFileExtensionCallback = () => {
      // Since the request is aborted, make sure the url is updated in the browser history.
      // Automatically marks the url as visited etc.
      let videoPage = properties.addon.chromePageUrl + url;

      asyncHistory.updatePlaces({
        title: "Redirected by gfycat companion, " + url,
        uri: request.URI,
        visits: [{
          transitionType: Ci.nsINavHistoryService.TRANSITION_LINK,
          visitDate: (Date.now()) * 1000
        }]
      });

      redirectRequest(request, videoPage);
    };

    let isNotGifFileExtensionCallback = () => {
      // Disable the listener before redirect so the listener does not loop.
      doEnable(false);
      redirectRequest(request, url);
      timers.setTimeout(() => {
        console.log("Enable");
        doEnable(true);
      }, 300);
    };

    // Check if image is a gif by doing a head request.
    console.log("Check content type");
    urlHelper.asyncIsContentTypeGif(url, isGifFileExtensionCallback, isNotGifFileExtensionCallback);
  }
}
