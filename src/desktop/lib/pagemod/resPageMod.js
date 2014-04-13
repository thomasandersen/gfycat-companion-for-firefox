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

exports.enable = (enable) => {
  return doEnable(enable);
};

let pageMod = null;
let gWorker = null;

function doEnable(enable) {
  resImageRequestBlocker.enable(enable);
  if (!enable) {
    try {
      pageMod.destroy();
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
    onTranscodeError(gifKey, worker, "Could not transform " + urlHelper.getFileExtension(gifUrl) + " to gfycat video. Displaying original image", false);
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
    onTranscodeError(gifKey, worker, "Unknown error. There was no JSON in the response", false);
  } else if (response.status >= 400) {
    onTranscodeError(gifKey, worker, "Server eroor. Status " + response.status + ", " + response.statusText, false);
  } else if (response.json.error) {
    let gfyErrorMessage = response.json.error;
    onTranscodeError(gifKey, worker, "Could not convert gif. " + gfyErrorMessage, gfyErrorMessage.length < 100);
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

function onTranscodeError(gifKey, worker, errorMessage, showErrorMessage) {
  worker.port.emit("transcodeRequestError", gifKey, errorMessage, showErrorMessage);
}

function enableResPageMod() {
  pageMod = PageMod({
    include: ["*.reddit.com"],
    attachTo: ["existing", "top"],
    contentScriptFile: [
      self.data.url("pagemod/global.js"),
      self.data.url("pagemod/domHelper.js"),
      self.data.url("pagemod/RES.js"),
      self.data.url("pagemod/companion.js"),
      self.data.url("pagemod/resPageMod.js")
    ],
    contentStyleFile: self.data.url("pagemod/style/pagemod.css"),
    onAttach: function(worker) {
      gWorker = worker;
      worker.port.on("requestTranscoder", (gifUrl, gifKey) => {
        console.log("requestTranscoder", gifKey);
        checkContentTypeBeforeRequestingGfyTranscoder(gifUrl, gifKey, worker);
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
