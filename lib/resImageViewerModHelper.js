let { Cu } = require("chrome");
let self = require("sdk/self");
let properties = require("./properties");
let hasher = require("./sha1");
let urlHelper = require("./urlHelper");
let PageMod = require("sdk/page-mod").PageMod;
let Request = require("sdk/request").Request;

Cu.import("resource://gre/modules/AddonManager.jsm");

exports.enable = (enable) => {
  return doEnable(enable);
}

let pageMod = null;
let gWorker = null;

function getBandwidthSavedInMB(gfyInfo) {
  let gifSize = gfyInfo.gifSize;
  let gfySize = gfyInfo.gfysize;
  return (gifSize - gfySize) / 1024 / 1024;
}

function doEnable(enable) {
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
    if (addOn && addOn.isActive == true) {
      enablePageMod();
    }
  });
}

function resolveResponse(response, requestedUrl, gifKey, worker) {
  console.log("gfycat http response: " + response.status, response.json);

  if (response.status >= 400) {
    onError(response, gifKey, worker, "Something went wrong. Server responded with: Status " + repsonse.status + ", " + response.statusText, false);
  } else if (!urlHelper.isGif(requestedUrl)) {
    onError(response, gifKey, worker, "Could not convert " + urlHelper.getFileExtension(requestedUrl) + " to gfycat video. Displaying original image", false);
  } else if (response.json.error) {
    onError(response, gifKey, worker, "Could not convert gif. " + response.json.error, true);
  } else {
    // Success
    let gfyInfo = response.json;
    let bytesSaved = getBandwidthSavedInMB(gfyInfo);
    let message = "About " + bytesSaved.toPrecision(2) + " MB of bandwidth was saved";
    if (bytesSaved < 0) {
      message = "huh! the gfycat video (" + gfyInfo.gfysize + " Bytes) is actually larger than the gif (" + gfyInfo.gifSize + " Bytes)";
    }
    onSuccess(response, gifKey, worker, message);
  }
}

function onSuccess(response, gifKey, worker, loadingMessage) {
  worker.port.emit("gfyInfoFetchSuccess", response.json, gifKey, loadingMessage);
}

function onError(response, gifKey, worker, errorMessage, showErrorMessage) {
  worker.port.emit("gfyInfoFetchError", response.json, gifKey, errorMessage, showErrorMessage);
}

function requestGfyInfo(gifUrl, gifKey, worker) {
  let url = properties.gfycat.transcodeEndpoint +  hasher.sha1(gifUrl).substring(0,9) + "?fetchUrl=" + gifUrl;
  Request({
    url: url,
    onComplete: (response) => {
      resolveResponse(response, gifUrl, gifKey, worker);
    }
  }).get();
}

function enablePageMod() {
  pageMod = PageMod({
    include: ["*.reddit.com"],
    attachTo: ["existing", "top"],
    contentScriptFile: self.data.url("script/resImageViewerMod.js"),
    contentStyleFile: self.data.url("css/resImageViewerMod.css"),
    onAttach: function(worker) {
      gWorker = worker;
      worker.port.on("fetchGfyInfo", (gifUrl, gifKey) => {
        requestGfyInfo(gifUrl, gifKey, worker);
      });
    },
    contentScriptWhen: "ready"
  });
}
