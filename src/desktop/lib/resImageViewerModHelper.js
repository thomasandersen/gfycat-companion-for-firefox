/**
 * Issue: http://i.imgur.com/5LEb4IH.jpg, Could not convert gif. Key already in use.  Please choose unique key or do not specify
 */

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
};

let pageMod = null;
let gWorker = null;

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
    if (addOn && addOn.isActive) {
      enableResPageMod();
    }
  });
}

function checkContentTypeBeforeRequestingGfyTranscoder(gifUrl, gifKey, worker) {
  Request({
    url: gifUrl,
    onComplete: (response) => {
      let contentType = response.headers["Content-Type"];
      if (contentType.toLowerCase().contains("gif")) {
        requestGfyTranscoder(gifUrl, gifKey, worker);
      } else {
        onTranscodeError(gifKey, worker, "Could not transform " + urlHelper.getFileExtension(gifUrl) + " to gfycat video. Displaying original image", false);
      }
    }
  }).head();
}

function requestGfyTranscoder(gifUrl, gifKey, worker) {
  let url = properties.gfycat.transcodeEndpoint +  hasher.sha1(gifUrl).substring(0,9) + "?fetchUrl=" + gifUrl;
  Request({
    url: url,
    onComplete: (response) => {
      resolveTranscodingResponse(response, gifUrl, gifKey, worker);
    }
  }).get();
}

function resolveTranscodingResponse(response, requestedUrl, gifKey, worker) {
  console.log("gfycat http response: " + response.status, response.json);

  if (response.status >= 400) {
    onTranscodeError(gifKey, worker, "Something went wrong. Server responded with: Status " + repsonse.status + ", " + response.statusText, false);
  } else if (response.json.error) {
    onTranscodeError(gifKey, worker, "Could not convert gif. " + response.json.error, true);
  } else {
    // Success
    let transcodingJson = response.json;
    let bytesSaved = getBandwidthSavedInMB(transcodingJson);
    let message = "About " + bytesSaved.toPrecision(2) + " MB of bandwidth was saved";
    if (bytesSaved < 0) {
      message = "The gfycat video file size (" + transcodingJson.gfysize + " Bytes) is actually larger than the gif (" + transcodingJson.gifSize + " Bytes)";
    }
    onTranscodeSuccess(response, gifKey, worker, message);
  }
}

function onTranscodeSuccess(response, gifKey, worker, loadingMessage) {
  worker.port.emit("transcodeSuccess", response.json, gifKey, loadingMessage);
}

function onTranscodeError(gifKey, worker, errorMessage, showErrorMessage) {
  worker.port.emit("transcodeError", gifKey, errorMessage, showErrorMessage);
}

function enableResPageMod() {
  pageMod = PageMod({
    include: ["*.reddit.com"],
    attachTo: ["existing", "top"],
    contentScriptFile: self.data.url("script/resImageViewerMod.js"),
    contentStyleFile: self.data.url("css/resImageViewerMod.css"),
    onAttach: function(worker) {
      gWorker = worker;
      worker.port.on("requestGfyTranscoder", (gifUrl, gifKey) => {
        checkContentTypeBeforeRequestingGfyTranscoder(gifUrl, gifKey, worker);
      });
    },
    contentScriptWhen: "ready"
  });
}

function getBandwidthSavedInMB(gfyInfo) {
  let gifSize = gfyInfo.gifSize;
  let gfySize = gfyInfo.gfysize;
  return (gifSize - gfySize) / 1024 / 1024;
}