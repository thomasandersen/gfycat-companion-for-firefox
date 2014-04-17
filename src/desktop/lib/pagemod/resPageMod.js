let { Cu } = require("chrome");
let self = require("sdk/self");
let PageMod = require("sdk/page-mod").PageMod;
let Request = require("sdk/request").Request;
let preferencesService = require("sdk/preferences/service");
let properties = require("packages/properties");
let urlHelper = require("packages/urlHelper");
let resImageRequestBlocker = require("./resImageRequestBlocker");

Cu.import("resource://gre/modules/AddonManager.jsm");
Cu.import("chrome://gfycat/content/jsm/bytesSaved.jsm");

exports.enable = (aEnable) => {
  return doEnable(aEnable);
};

let gPageMod = null;
let gWorker = null;

function doEnable(aEnable) {
  resImageRequestBlocker.enable(aEnable);
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

function requestGfyTranscoder(aImageUrl, aImageKey, aWorker) {
  aWorker.port.emit("transcodeRequestStart", aImageUrl, aImageKey);

  Request({
    url: createTranscoderUrl(aImageUrl),
    onComplete: (response) => {
      resolveTranscodeResponse(response, aImageKey, aWorker);
    }
  }).get();
}

function resolveTranscodeResponse(aResponse, aImageKey, aWorker) {
  console.log("Transcode response ", aResponse);

  if (!aResponse.json) {
    onTranscodeError(aImageKey, aWorker,
      "Unknown error. There was no JSON in the response");
  } else if (aResponse.status >= 400) {
    onTranscodeError(aImageKey, aWorker, "Server eroor. Status " +
      aResponse.status + ", " + aResponse.statusText);
  } else if (aResponse.json.error) {
    let gfyErrorMessage = aResponse.json.error;
    onTranscodeError(aImageKey, aWorker, "Could not convert gif. " +
      gfyErrorMessage);
  } else {
    // Success
    let transcodingJson = aResponse.json;
    let mbSaved = getBandwidthSavedInMB(transcodingJson);
    let message = "About " + mbSaved.toPrecision(2) +
      " MB of internet bandwidth was saved";
    if (mbSaved < 0) {
      message = "The gfycat video file size (" +
        transcodingJson.gfysize + " Bytes) is actually larger than the gif (" +
        transcodingJson.gifSize + " Bytes)";
    }

    saveBandwidthSaved(transcodingJson);

    onTranscodeSuccess(aResponse, aImageKey, aWorker, message);
  }
}

function onTranscodeSuccess(aResponse, aImageKey, worker, aLoadingMessage) {
  worker.port.emit("transcodeRequestSuccess",
    aResponse.json, aImageKey, aLoadingMessage);
}

function onTranscodeError(aImageKey, aWorker, aErrorMessage) {
  resImageRequestBlocker.enable(false);
  aWorker.port.emit("transcodeRequestError", aImageKey, aErrorMessage);
}

function enableResPageMod() {
  gPageMod = PageMod({
    include: ["*.reddit.com"],
    attachTo: ["existing", "top"],
    contentScriptFile: [
      self.data.url("pagemod/domHelper.js"),
      self.data.url("pagemod/RES.js"),
      self.data.url("pagemod/companion.js"),
      self.data.url("pagemod/pageMod.js")
    ],
    contentStyleFile: self.data.url("pagemod/style/pagemod.css"),
    onAttach: function(worker) {
      gWorker = worker;
      worker.port.on("requestTranscoder", (imageUrl, aImageKey) => {
        console.log("requestTranscoder", aImageKey);
        resImageRequestBlocker.enable(true);
        requestGfyTranscoder(imageUrl, aImageKey, worker);
      });
      worker.port.on("enableImageRequestBlocker", () => {
        resImageRequestBlocker.enable(true);
      });
    },
    contentScriptWhen: "ready"
  });
}

function createTranscoderUrl(aImageUrl) {
  return properties.gfycat.transcodeEndpoint +
    createPsudoRandomStr(5) + "?fetchUrl=" + aImageUrl;
}

function createPsudoRandomStr(aStringLength) {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( let i=0; i < aStringLength; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
