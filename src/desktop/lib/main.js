let self = require("sdk/self");
let properties = require("./properties");
let httpRequestListener = require("./httpRequestListener");
let resImageViewerModHelper = require("./resImageViewerModHelper");
let simplePrefs = require("sdk/simple-prefs");
let clipboard = require("sdk/clipboard");
let tabs = require("sdk/tabs");
let contextMenu = require("sdk/context-menu");

const CONTEXT_MENU_CONTEXT_SELECTOR = "img[src*=\".gif\"], a[href*=\".gif\"]";

// ------------------------------------------------------------------------------
// Setup listeners
// ------------------------------------------------------------------------------

simplePrefs.on("redirectDirectGifRequests", () => {
  httpRequestListener.enable(simplePrefs.prefs.redirectDirectGifRequests);
});

simplePrefs.on("resImageViewerSupport", () => {
  resImageViewerModHelper.enable(simplePrefs.prefs.resImageViewerSupport);
});

// ------------------------------------------------------------------------------
// Setup context menu
// ------------------------------------------------------------------------------

contextMenu.Item({
  label: "Open with gfycat",
  data: "gccfx-openWithGfyCat",
  context: contextMenu.SelectorContext(CONTEXT_MENU_CONTEXT_SELECTOR),
  contentScriptFile: self.data.url("pagemod/contextMenuClick.js"),
  image: self.data.url("images/icon-16.png"),
  onMessage: function (link) {
    tabs.open(properties.gfycat.fetchEndpoint + link);
  }
});

contextMenu.Item({
  label: "Copy as gfycat URL",
  data: "gccfx-menuItemCopyAsGfycatUrl",
  context: contextMenu.SelectorContext(CONTEXT_MENU_CONTEXT_SELECTOR),
  contentScriptFile: self.data.url("pagemod/contextMenuClick.js"),
  image: self.data.url("images/icon-16.png"),
  onMessage: function (link) {
    clipboard.set(properties.gfycat.fetchEndpoint + link);
  }
});

// ------------------------------------------------------------------------------
// Start
// ------------------------------------------------------------------------------

httpRequestListener.enable(simplePrefs.prefs.redirectDirectGifRequests);
resImageViewerModHelper.enable(simplePrefs.prefs.resImageViewerSupport);