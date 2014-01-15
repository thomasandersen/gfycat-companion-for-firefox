let { Ci, Cr } = require("chrome");
let systemEvents = require("sdk/system/events");
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

// Make sure inline requests to gif hosting services requested by reddit.com is canceled.
// RES image viewer will create a video request instead. 
// fixme: should listen for preference: resImageViewerSupport
function requestListener(event) {
  let request = event.subject;
  let channel = request.QueryInterface(Ci.nsIHttpChannel);
  let url = request.URI.spec;
  let isInitialDocument = isChannelInitialDocument(channel);

  let isImage = urlHelper.isImage(url);
  let isRequestedByReddit = request.referrer && request.referrer.host == "www.reddit.com";

  if (isImage && isRequestedByReddit) {

    // Must be one of the hosting services.
    let domain = urlHelper.getDomainForHost(request.URI.host);
    if (!isInitialDocument && properties.gifHostingServices.indexOf(domain) > -1) {
      console.log("cancel request to " + domain + " gif");
      channel.cancel(Cr.NS_BINDING_ABORTED);
    }
  }

}
