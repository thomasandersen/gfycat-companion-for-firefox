let { Cc, Ci, Cu } = require("chrome");
let self = require("sdk/self");
let simplePrefs = require("sdk/simple-prefs");
let systemEvents = require("sdk/system/events");
let clipboard = require("sdk/clipboard");
let windowUtils = require("sdk/window/utils");
let tabs = require("sdk/tabs");
let cm = require("sdk/context-menu");
let PageMod = require("sdk/page-mod").PageMod;
Cu.import("resource://gre/modules/AddonManager.jsm");

// ------------------------------------------------------------------------------
// Constants and Variables
// ------------------------------------------------------------------------------

const GFYCAT_URL = "http://gfycat.com/fetch/";
const RES_ADDON_ID = "jid1-xUfzOsOFlzSOXg@jetpack";

var resPageMod = null;

// ------------------------------------------------------------------------------
// Create helper functions
// ------------------------------------------------------------------------------

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

function httpResponseListener(event) {
  if (!simplePrefs.prefs.redirectGifResponses) {
    return;
  }
  let channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
  let isGifRequest = /gif/.test(channel.getResponseHeader("Content-Type"));
  if (isChannelInitialDocument(channel) && isGifRequest) {
    channel.cancel(Cc.NS_BINDING_ABORTED);
    let url = event.subject.URI.spec;
    let gBrowser = windowUtils.getMostRecentBrowserWindow().gBrowser;
    let domWin = getWindowForRequest(event.subject);
    let browser = gBrowser.getBrowserForDocument(domWin.top.document);
    browser.loadURI(GFYCAT_URL + url);
  }
}

function enableHttpResponseListener(enable) {
  if (enable) {
    systemEvents.on("http-on-examine-response", httpResponseListener);
    systemEvents.on("http-on-examine-cached-response", httpResponseListener);
  } else {
    systemEvents.off("http-on-examine-response", httpResponseListener);
    systemEvents.off("http-on-examine-cached-response", httpResponseListener);
  }
}

// fixme: should be enabled/disabled on install/uninstall RES add-on.
function enableResPageMod(enable) {
  if (!enable) {
    try {
      resPageMod.destroy();
    } catch(ex) {
    }
    return;
  }
  AddonManager.getAddonByID(RES_ADDON_ID, (result) => {
    if (result && result.isActive == true) {
      resPageMod = PageMod({
        include: ["*"],
        attachTo: ["existing", "top"],
        contentScriptFile: self.data.url("script/resPageMod.js"),
        contentScriptWhen: "ready"
      });
    }
  });
}

// ------------------------------------------------------------------------------
// Setup listeners
// ------------------------------------------------------------------------------

enableHttpResponseListener(simplePrefs.prefs.redirectGifResponses);

simplePrefs.on("redirectGifResponses", () => {
  enableHttpResponseListener(simplePrefs.prefs.redirectGifResponses);
});
simplePrefs.on("experimental", (prefName) => {
  enableResPageMod(simplePrefs.prefs.experimental);
});

// ------------------------------------------------------------------------------
// Setup context menu
// ------------------------------------------------------------------------------

cm.Item({
  label: "Open with gfycat",
  context: cm.SelectorContext("img"),
  contentScriptFile: self.data.url("script/contextMenuClick.js"),
  onMessage: function (src) {
    tabs.open(GFYCAT_URL + src);
  }
});

cm.Item({
  label: "Copy as gfycat URL",
  context: cm.SelectorContext("img"),
  contentScriptFile: self.data.url("script/contextMenuClick.js"),
  onMessage: function (src) {
    clipboard.set(GFYCAT_URL + src);
  }
});

// ------------------------------------------------------------------------------
// Setup RES page mod
// ------------------------------------------------------------------------------

enableResPageMod(simplePrefs.prefs.experimental);