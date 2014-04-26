let { Cu } = require("chrome");
let self = require("sdk/self");
let PageMod = require("sdk/page-mod").PageMod;
let preferencesService = require("sdk/preferences/service");
let properties = require("packages/properties");
let Transcoder = require("./transcoder");
let imageRequestBlocker = require("./imageRequestBlocker");

Cu.import("resource://gre/modules/AddonManager.jsm");

exports.enable = (aEnable) => {
  return doEnable(aEnable);
};

let gPageMod = null;
let gWorker = null;

function doEnable(aEnable) {
  if (!aEnable) {
    try {
      gPageMod.destroy();
      gWorker.port.emit("resImageViewerSupportDisabled");
    }
    catch(ex) {
    }
    return;
  }
  AddonManager.getAddonByID(properties.res.addOnId, (addOn) => {
    if (addOn && addOn.isActive) {
      enableResPageMod();
    }
  });
}

function enableResPageMod() {
  gPageMod = PageMod({
    include: ["*.reddit.com"],
    attachTo: ["existing", "top"],
    contentScriptFile: [
      self.data.url("pagemod/domHelper.js"),
      self.data.url("pagemod/RES.js"),
      self.data.url("pagemod/companion.js"),
      self.data.url("pagemod/main.js")
    ],
    contentStyleFile: self.data.url("pagemod/style/pagemod.css"),
    onAttach: function(worker) {
      gWorker = worker;
      worker.port.on("requestTranscoder", (imageUrl, aImageKey) => {
        console.log("requestTranscoder", aImageKey);
        imageRequestBlocker.enable(true);
        Transcoder.request(imageUrl, aImageKey, worker);
      });
      worker.port.on("enableImageRequestBlocker", () => {
        imageRequestBlocker.enable(true);
      });
    },
    contentScriptWhen: "ready"
  });
}

imageRequestBlocker.enable(false);
