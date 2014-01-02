let { Cu } = require("chrome");
let self = require("sdk/self");
let properties = require("./properties");
let hasher = require("./sha1");
let PageMod = require("sdk/page-mod").PageMod;
let Request = require("sdk/request").Request;

Cu.import("resource://gre/modules/AddonManager.jsm");

exports.enable = (enable) => {
  return doEnable(enable);
}

let pageMod = null;
let gWorker = null;

function getFileExtension(url) {
  return url.split('.').pop();
}

function urlEndsWithDotGif(url) {
  return /\.gif.*$/.test(url);
}

function doEnable(enable) {
  if (!enable) {
    try { 
      pageMod.destroy(); 
      gWorker.port.emit("pageModDestroyed");
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

function onSuccess(response, gifKey, worker) {
  worker.port.emit("gfyInfoFetchSuccess", response.json, gifKey);
}

function onInvalidFileExtension(gifUrl, gifKey, worker) {
  worker.port.emit("gfyInfoFetchError", { 
    error: getFileExtension(gifUrl) + " extension detected. Image not sent to gfycat" 
  }, gifKey);
}

function onError(response, gifKey, worker) {
  worker.port.emit("gfyInfoFetchError", response.json, gifKey);
}

function requestGfyInfo(gifUrl, gifKey, worker) {
  let url = properties.gfycat.transcodeEndpoint +  hasher.sha1(gifUrl).substring(0,9) + "?fetchUrl=" + gifUrl;
  console.log("Load gfy info", url);
  Request({
    url: url,
    onComplete: (response) => {
      console.log("gfycat http response: " + response.status, response.json);
      if (response.status >= 400 || response.json.error || !response.json.webmUrl) {
        onError(response, gifKey, worker);
      } else {
        onSuccess(response, gifKey, worker);
      } 
    }
  }).get();
}

function enablePageMod() {
  pageMod = PageMod({
    include: ["*"],
    attachTo: ["existing", "top"],
    contentScriptFile: self.data.url("script/resPageMod.js"),
    onAttach: function(worker) {
      gWorker = worker;
      worker.port.on("fetchGfyInfo", (gifUrl, gifKey) => {
        if (!urlEndsWithDotGif(gifUrl)) {
          onInvalidFileExtension(gifUrl, gifKey, worker);
        } else {
          requestGfyInfo(gifUrl, gifKey, worker);
        }
      });

    },
    contentScriptWhen: "ready"
  });
}
