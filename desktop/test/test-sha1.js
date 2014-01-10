let hasher = require("./sha1");

exports["test hasher"] = function(assert, done) {
  assert.equal(hasher.sha1("http://i.imgur.com/jqVmuPG.gif"), "6b7e39eb6ce64a8b3f2c3485db621733a99057de", "Should return a sha1 hashed string");
  assert.equal(hasher.sha1("bf8eeec93ab23275e3cc0fd64bd9f74ea60ddd93"), "781292eddb1621eef228c5e3ad9b49d6da78deaf", "Should return a sha1 hashed string");
  done();
};

require("sdk/test").run(exports);