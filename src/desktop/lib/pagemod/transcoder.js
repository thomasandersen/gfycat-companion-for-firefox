let { Cu } = require("chrome");
let Request = require("sdk/request").Request;
let properties = require("packages/properties");
let imageRequestBlocker = require("./imageRequestBlocker");

Cu.import("chrome://gfycat/content/jsm/bytesSaved.jsm");

function request(aImageUrl, aImageKey, aWorker) {
  Request({
    url: createUrl(aImageUrl),
    onComplete: (response) => {
      onResponse(response, aImageKey, aWorker);
    }
  }).get();
  aWorker.port.emit("transcodeRequestStart", aImageUrl, aImageKey);
}

function onResponse(aResponse, aImageKey, aWorker) {
  console.log("Transcode response ", aResponse);

  if (!aResponse.json) {
    onError(aImageKey, aWorker,
      "Unknown error. There was no JSON in the response");
  } else if (aResponse.status >= 400) {
    onError(aImageKey, aWorker, "Server eroor. Status " +
      aResponse.status + ", " + aResponse.statusText);
  } else if (aResponse.json.error) {
    let gfyErrorMessage = aResponse.json.error;
    onError(aImageKey, aWorker, "Could not convert gif. " +
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

    onSuccess(aResponse, aImageKey, aWorker, message);
  }
}

function onSuccess(aResponse, aImageKey, worker, aLoadingMessage) {
  worker.port.emit("transcodeRequestSuccess",
    aResponse.json, aImageKey, aLoadingMessage);
}

function onError(aImageKey, aWorker, aErrorMessage) {
  imageRequestBlocker.enable(false);
  aWorker.port.emit("transcodeRequestError", aImageKey, aErrorMessage);
}

function createUrl(aImageUrl) {
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

exports.request = request;