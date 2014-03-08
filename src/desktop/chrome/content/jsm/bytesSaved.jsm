var EXPORTED_SYMBOLS = [
  "getBandwidthSavedInMB", 
  "saveBandwidthSaved", 
  "getTotalBandwidthSavedInMB"
];

var preferencesService = Components.classes["@mozilla.org/preferences-service;1"]
                           .getService(Components.interfaces.nsIPrefBranch);
var prefName = "extensions.gfycatCompanion.bandwidthSavedBytes";

function getBandwidthSavedInMB(json) {
  var gifSize = json.gifSize;
  var gfySize = json.gfysize;
  return (gifSize - gfySize) / 1024 / 1024;
}

function saveBandwidthSaved(json) {
  var bytesSaved = json.gifSize - json.gfysize;
  if (bytesSaved > 0) {
    try {
      var totalBytesSaved = parseFloat(preferencesService.getCharPref(prefName)) + bytesSaved;
      preferencesService.setCharPref(prefName, String(totalBytesSaved));
    } catch(ex) {
      preferencesService.setCharPref(prefName, String(bytesSaved));
    }
  }
}

function getTotalBandwidthSavedInMB() {
  try {
    var result = null;
    var bandwidthSaved = parseFloat(preferencesService.getCharPref(prefName));
    if (bandwidthSaved) {
      result = bandwidthSaved / 1024 / 1024;
    }
    return result;
  } catch(ex) {
    return null;
  }
}