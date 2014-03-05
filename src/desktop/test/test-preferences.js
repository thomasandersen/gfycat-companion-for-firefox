let simplePrefs = require("sdk/simple-prefs");

exports["test that preferences exists"] = function(assert, done) {
  assert.ok(simplePrefs.prefs.showVideoInsteadOfGif != null, "preference .showVideoInsteadOfGif should exist");
  assert.ok(simplePrefs.prefs.resImageViewerSupport != null, "preference .resImageViewerSupport should exist");

  done();
};

require("sdk/test").run(exports);
