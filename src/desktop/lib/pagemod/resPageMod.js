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

function checkContentTypeBeforeRequestingGfyTranscoder(gifUrl, gifKey, worker) {
  console.log("Checking content type", gifUrl);

  let isGifFileExtensionCallback = () => {
    requestGfyTranscoder(gifUrl, gifKey, worker);
  };

  let isNotGifCallback = () => {
    onTranscodeError(gifKey, worker, "Could not transform " + urlHelper.getFileExtension(gifUrl) + " to gfycat video. Displaying original image");
  };

  urlHelper.asyncIsContentTypeGif(gifUrl, isGifFileExtensionCallback, isNotGifCallback);
}

function requestGfyTranscoder(gifUrl, gifKey, worker) {
  let url = properties.gfycat.transcodeEndpoint +  createPsudoRandomStr(5) + "?fetchUrl=" + gifUrl;
  worker.port.emit("transcodeRequestStart", gifUrl, gifKey);

  Request({
    url: url,
    onComplete: (response) => {
      resolveTranscodeResponse(response, gifUrl, gifKey, worker);
    }
  }).get();
}

function resolveTranscodeResponse(response, requestedUrl, gifKey, worker) {
  console.log("Transcode response ", response);
  console.log("Transcode response gifKey ", gifKey);

  if (!response.json) {
    onTranscodeError(gifKey, worker, "Unknown error. There was no JSON in the response");
  } else if (response.status >= 400) {
    onTranscodeError(gifKey, worker, "Server eroor. Status " + response.status + ", " + response.statusText);
  } else if (response.json.error) {
    let gfyErrorMessage = response.json.error;
    onTranscodeError(gifKey, worker, "Could not convert gif. " + gfyErrorMessage);
  } else {
    // Success
    let transcodingJson = response.json;
    let mbSaved = getBandwidthSavedInMB(transcodingJson);
    let message = "About " + mbSaved.toPrecision(2) + " MB of internet bandwidth was saved";
    if (mbSaved < 0) {
      message = "The gfycat video file size (" + transcodingJson.gfysize + " Bytes) is actually larger than the gif (" + transcodingJson.gifSize + " Bytes)";
    }

    saveBandwidthSaved(transcodingJson);

    onTranscodeSuccess(response, gifKey, worker, message);
  }
}

function onTranscodeSuccess(response, gifKey, worker, loadingMessage) {
  worker.port.emit("transcodeRequestSuccess", response.json, gifKey, loadingMessage);
}

function onTranscodeError(gifKey, worker, errorMessage) {
  resImageRequestBlocker.enable(false);
  worker.port.emit("transcodeRequestError", gifKey, errorMessage);
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
      worker.port.on("requestTranscoder", (gifUrl, gifKey) => {
        console.log("requestTranscoder", gifKey);
        //checkContentTypeBeforeRequestingGfyTranscoder(gifUrl, gifKey, worker);
        resImageRequestBlocker.enable(true);
        requestGfyTranscoder(gifUrl, gifKey, worker);
      });
      worker.port.on("enableImageRequestBlocker", () => {
        resImageRequestBlocker.enable(true);
      });
    },
    contentScriptWhen: "ready"
  });
}

function createPsudoRandomStr(stringLength) {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( let i=0; i < stringLength; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
