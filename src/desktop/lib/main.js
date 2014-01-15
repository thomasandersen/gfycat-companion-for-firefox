let self = require("sdk/self");
let simplePrefs = require("sdk/simple-prefs");
let clipboard = require("sdk/clipboard");
let tabs = require("sdk/tabs");
let contextMenu = require("sdk/context-menu");
let properties = require("packages/properties");
let gifRequestBlocker = require("packages/gifRequestBlocker");
let resImageViewerModHelper = require("./resImageViewerModHelper");

const CONTEXT_MENU_CONTEXT_SELECTOR = "img[src*=\".gif\"], a[href*=\".gif\"]";

// ------------------------------------------------------------------------------
// Setup listeners
// ------------------------------------------------------------------------------

simplePrefs.on("redirectDirectGifRequests", () => {
  gifRequestBlocker.enable(simplePrefs.prefs.redirectDirectGifRequests);
});

simplePrefs.on("resImageViewerSupport", () => {
  let enable = simplePrefs.prefs.resImageViewerSupport;
  resImageViewerModHelper.enable(enable);
  gifRequestBlocker.enable(enable);
});

// ------------------------------------------------------------------------------
// Setup context menu
// ------------------------------------------------------------------------------

contextMenu.Item({
  label: "Open with gfycat",
  data: "gccfx-openWithGfyCat",
  context: contextMenu.SelectorContext("img[src*=\".gif\"]"),
  contentScriptFile: self.data.url("pagemod/contextMenuClick.js"),
  image: self.data.url("images/icon-16.png"),
  onMessage: function (link) {
    tabs.open(properties.gfycat.fetchEndpoint + link);
  }
});

contextMenu.Item({
  label: "Copy as gfycat URL",
  data: "gccfx-menuItemCopyAsGfycatUrl",
  context: contextMenu.SelectorContext("img[src*=\".gif\"], a[href*=\".gif\"]"),
  contentScriptFile: self.data.url("pagemod/contextMenuClick.js"),
  image: self.data.url("images/icon-16.png"),
  onMessage: function (link) {
    clipboard.set(properties.gfycat.fetchEndpoint + link);
  }
});

// ------------------------------------------------------------------------------
// Start
// ------------------------------------------------------------------------------

gifRequestBlocker.enable(simplePrefs.prefs.redirectDirectGifRequests);
resImageViewerModHelper.enable(simplePrefs.prefs.resImageViewerSupport);