let { Cc, Ci, Cu } = require("chrome");
let hasher = require("./sha1");
let self = require("sdk/self");
let simplePrefs = require("sdk/simple-prefs");
let systemEvents = require("sdk/system/events");
let clipboard = require("sdk/clipboard");
let windowUtils = require("sdk/window/utils");
let tabs = require("sdk/tabs");
let contextMenu = require("sdk/context-menu");
let PageMod = require("sdk/page-mod").PageMod;
let Request = require("sdk/request").Request;

Cu.import("resource://gre/modules/AddonManager.jsm");

// ------------------------------------------------------------------------------
// Constants and Variables
// ------------------------------------------------------------------------------

const GFYCAT_FETCH_URL = "http://gfycat.com/fetch/";
const GFYCAT_TRANSCODE_URL = "http://upload.gfycat.com/transcode/";
const RES_ADDON_ID = "jid1-xUfzOsOFlzSOXg@jetpack";
const CONTEXT_MENU_CONTEXT_SELECTOR = "img, a[href*=\".gif\"]";

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

function httpRequestListener(event) {
  let channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
  let url = event.subject.URI.spec;
  if (url.startsWith(GFYCAT_FETCH_URL)) {
    return;
  }
  if (isChannelInitialDocument(channel) && url.endsWith(".gif")) {
    channel.cancel(Cc.NS_BINDING_ABORTED);
    let gBrowser = windowUtils.getMostRecentBrowserWindow().gBrowser;
    let domWin = getWindowForRequest(event.subject);
    let browser = gBrowser.getBrowserForDocument(domWin.top.document);
    browser.loadURI(GFYCAT_FETCH_URL + url);
    
  }
}

function enableHttpRequestListener(enable) {
  if (enable) {
    systemEvents.on("http-on-modify-request", httpRequestListener);
  } else {
    systemEvents.off("http-on-modify-request", httpRequestListener);
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
        onAttach: function(worker) {
          worker.port.on("fetchGfyInfo", (gifUrl, elementsKey) => {
            // fixme: create function
            Request({
              url: GFYCAT_TRANSCODE_URL +  hasher.sha1(gifUrl).substring(0,9) + "?fetchUrl=" + gifUrl,
              onComplete: (response) => {
                worker.port.emit("gfyInfoFetched", response.json, elementsKey);
              }
            }).get();
          });

        },
        contentScriptWhen: "ready"
      });
    }
  });
}

// ------------------------------------------------------------------------------
// Setup listeners
// ------------------------------------------------------------------------------

enableHttpRequestListener(simplePrefs.prefs.redirectDirectGifRequests);

simplePrefs.on("redirectDirectGifRequests", () => {
  enableHttpRequestListener(simplePrefs.prefs.redirectDirectGifRequests);
});
simplePrefs.on("experimental", (prefName) => {
  enableResPageMod(simplePrefs.prefs.experimental);
});

// ------------------------------------------------------------------------------
// Setup context menu
// ------------------------------------------------------------------------------

contextMenu.Item({
  label: "Open with gfycat",
  context: contextMenu.SelectorContext(CONTEXT_MENU_CONTEXT_SELECTOR),
  contentScriptFile: self.data.url("script/contextMenuClick.js"),
  image: self.data.url("images/icon-16.png"),
  onMessage: function (link) {
    tabs.open(GFYCAT_FETCH_URL + link);
  }
});

contextMenu.Item({
  label: "Copy as gfycat URL",
  context: contextMenu.SelectorContext(CONTEXT_MENU_CONTEXT_SELECTOR),
  contentScriptFile: self.data.url("script/contextMenuClick.js"),
  image: self.data.url("images/icon-16.png"),
  onMessage: function (link) {
    clipboard.set(GFYCAT_FETCH_URL + link);
  }
});


// ------------------------------------------------------------------------------
// Setup RES page mod
// ------------------------------------------------------------------------------

enableResPageMod(simplePrefs.prefs.experimental);