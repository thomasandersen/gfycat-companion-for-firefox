let self = require("sdk/self");
let simplePrefs = require("sdk/simple-prefs");
let clipboard = require("sdk/clipboard");
let tabs = require("sdk/tabs");
let contextMenu = require("sdk/context-menu");
let properties = require("packages/properties");
let redirecter = require("packages/redirecter");
let resPageMod = require("./res/resPageMod");

// ------------------------------------------------------------------------------
// Setup listeners
// ------------------------------------------------------------------------------

simplePrefs.on("redirectDirectGifRequests", () => {
  redirecter.enable(simplePrefs.prefs.redirectDirectGifRequests);
});

simplePrefs.on("resImageViewerSupport", () => {
  let enable = simplePrefs.prefs.resImageViewerSupport;
  resPageMod.enable(enable);
  redirecter.enable(enable);
});

// ------------------------------------------------------------------------------
// Setup context menu items
// ------------------------------------------------------------------------------

contextMenu.Item({
  label: "Open with gfycat",
  data: "gccfx-openWithGfyCat",
  context: contextMenu.SelectorContext("img[src*=\".gif\"]"),
  contentScriptFile: self.data.url("contextMenuClick.js"),
  image: self.data.url("images/icon-16.png"),
  onMessage: function (link) {
    tabs.open(properties.gfycat.fetchEndpoint + link);
  }
});

contextMenu.Item({
  label: "Copy as gfycat URL",
  data: "gccfx-menuItemCopyAsGfycatUrl",
  context: contextMenu.SelectorContext("img[src*=\".gif\"], a[href*=\".gif\"]"),
  contentScriptFile: self.data.url("contextMenuClick.js"),
  image: self.data.url("images/icon-16.png"),
  onMessage: function (link) {
    clipboard.set(properties.gfycat.fetchEndpoint + link);
  }
});

// ------------------------------------------------------------------------------
// Initialize
// ------------------------------------------------------------------------------

redirecter.enable(simplePrefs.prefs.redirectDirectGifRequests);
resPageMod.enable(simplePrefs.prefs.resImageViewerSupport);