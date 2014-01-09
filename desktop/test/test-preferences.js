let simplePrefs = require("sdk/simple-prefs");

exports["test that preferences exists"] = function(assert, done) {
  console.log("PREF: " + simplePrefs.prefs.redirectDirectGifRequests);
  assert.ok(simplePrefs.prefs.redirectDirectGifRequests != null, "preference .redirectDirectGifRequests should exist");
  assert.ok(simplePrefs.prefs.resImageViewerSupport != null, "preference .resImageViewerSupport should exist");
  assert.ok(simplePrefs.prefs.experimental != null, "preference .experimental should exist");

  done();
};

require("sdk/test").run(exports);
