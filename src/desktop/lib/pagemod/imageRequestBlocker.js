let { Ci, Cr } = require("chrome");
let systemEvents = require("sdk/system/events");
let properties = require("packages/properties");
let urlHelper = require("packages/urlHelper");

exports.enable = (enable) => {
  return doEnable(enable);
};

function doEnable(aEnable) {
  if (aEnable) {
    console.log("Enable request blocker");
    systemEvents.on("http-on-modify-request", requestListener);
  } else {
    console.log("Disable request blocker");
    systemEvents.off("http-on-modify-request", requestListener);
  }
}

function isChannelInitialDocument(aHttpChannel) {
  return aHttpChannel.loadFlags & aHttpChannel.LOAD_INITIAL_DOCUMENT_URI;
}

// Make sure inline requests to gif hosting services requested by reddit.com is canceled.
// RES image viewer will create a video request instead.
// fixme: should listen for preference: resImageViewerSupport
function requestListener(aEvent) {
  let request = aEvent.subject;
  let channel = request.QueryInterface(Ci.nsIHttpChannel);
  let url = request.URI.spec;
  // Make sure flagged gifs falls through (see data/scripts/resImageViewerMod).
  if (url.contains("gccfxDoRequest=1")) {
    return;
  }

  let isInitialDocument = isChannelInitialDocument(channel);

  let isImageFileExtension = urlHelper.isImageFileExtension(url);
  let isRequestedByReddit = request.referrer && request.referrer.host == "www.reddit.com";

  if (isImageFileExtension && isRequestedByReddit) {

    // Must be one of the hosting services.
    let domain = urlHelper.getDomainForHostName(request.URI.host);
    if (!isInitialDocument && properties.gifHostingServices.indexOf(domain) > -1) {
      console.log("Cancel request to " + domain + " gif");
      channel.cancel(Cr.NS_BINDING_ABORTED);
    }
  }

}
