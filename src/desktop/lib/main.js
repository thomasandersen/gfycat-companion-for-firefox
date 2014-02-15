let self = require("sdk/self");
let simplePrefs = require("sdk/simple-prefs");
let clipboard = require("sdk/clipboard");
let tabs = require("sdk/tabs");
let contextMenu = require("sdk/context-menu");
let properties = require("packages/properties");
let redirecter = require("packages/redirecter");
let resPageMod = require("./pagemod/resPageMod");

// ------------------------------------------------------------------------------
// Setup listeners
// ------------------------------------------------------------------------------

simplePrefs.on("showVideoInsteadOfGif", () => {
  redirecter.enable(simplePrefs.prefs.showVideoInsteadOfGif);
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
  label: "View as HTML5 Video",
  data: "gccfx-viewAsHtml5Video",
  context: contextMenu.SelectorContext("img[src*=\".gif\"]"),
  contentScriptFile: self.data.url("contextMenuClick.js"),
  image: self.data.url("images/icon-16.png"),
  onMessage: function (src) {
    tabs.open(properties.addon.chromePageUrl + src);
  }
});

// ------------------------------------------------------------------------------
// Initialize
// ------------------------------------------------------------------------------

redirecter.enable(simplePrefs.prefs.showVideoInsteadOfGif);
resPageMod.enable(simplePrefs.prefs.resImageViewerSupport);