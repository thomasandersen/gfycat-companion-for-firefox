var EXPORTED_SYMBOLS = ["getBandwidthSavedInMB", "saveBandwidthSaved"];

var preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

function getBandwidthSavedInMB(json) {
  var gifSize = json.gifSize;
  var gfySize = json.gfysize;
  return (gifSize - gfySize) / 1024 / 1024;
}

function saveBandwidthSaved(json) {
  var bytesSaved = json.gifSize - json.gfysize;
  if (bytesSaved > 0) {
    try {
      var totalBytesSaved = parseFloat(preferencesService.getCharPref("extensions.gfycatCompanion.bandwidthSavedBytes")) + bytesSaved;
      preferencesService.setCharPref("extensions.gfycatCompanion.bandwidthSavedBytes", String(totalBytesSaved));
    } catch(ex) {
      preferencesService.setCharPref("extensions.gfycatCompanion.bandwidthSavedBytes", String(bytesSaved));
    }
  }
}