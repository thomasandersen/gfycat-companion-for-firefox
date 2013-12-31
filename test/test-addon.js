const { nsHttpServer } = require("sdk/test/httpd");
const { Cc, Ci, Cu } = require("chrome");
const main = require("./main");
const tabs = require("sdk/tabs");
const promise = require("sdk/core/promise");

// ------------------------------------------------------------------------------
// Start test server
// ------------------------------------------------------------------------------

let httpServer = createServer();
httpServer.start(-1);

// ------------------------------------------------------------------------------
// Test
// ------------------------------------------------------------------------------

exports["test add-on"] = function(assert, done) {
	createTabAndRequestTestPage(assert).then(() => {
	  assert.pass(true, "Passed");
	  httpServer.stop(done);
	});
};

// ------------------------------------------------------------------------------
// Helper functions
// ------------------------------------------------------------------------------

function createTabAndRequestTestPage(assert) {
  let deferred = promise.defer();
  tabs.open({ 
    url: "http://localhost:" + httpServer.identity.primaryPort + "/test/web/index.html",
    onReady: () => {
      deferred.resolve(assert);
    }
  });
  return deferred.promise;
}

function createServer() {
  let server = new nsHttpServer();
  let directoryService = Cc["@mozilla.org/file/directory_service;1"]
                   .getService(Ci.nsIProperties);
  let path = directoryService.get("CurWorkD", Ci.nsILocalFile);
  server.registerDirectory("/", path);
  return server;
}

require("sdk/test").run(exports);
