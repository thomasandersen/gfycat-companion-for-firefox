module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-mozilla-addon-sdk");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-clean");
  
  var SHARED_DIR = "src/shared";
  var DESKTOP_DIR = "src/desktop";
  var MOBILE_DIR = "src/mobile";
  var DIST_DIR = "dist";

  var JS_FILES_TO_REMOVE = ["/lib/gifRequestBlocker.js", "/lib/properties.js", "/lib/urlHelper.js"];
  var FILES_TO_REMOVE = [];
  for (var i = 0; i < JS_FILES_TO_REMOVE.length; i++) {
    FILES_TO_REMOVE.push(DESKTOP_DIR + JS_FILES_TO_REMOVE[i]);
    FILES_TO_REMOVE.push(MOBILE_DIR + JS_FILES_TO_REMOVE[i]);
  }

  grunt.initConfig({
    "mozilla-addon-sdk": {
      "1_15": {
        "options": {
          "revision": "1.15"
        }
      },
      "master": {
        "options": {
          "revision": "master",
          "github": true,
        }
      }
    },

    "mozilla-cfx": {
      "run_desktop": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": DESKTOP_DIR,
          "command": "run",
          "arguments": "-p ~/mozilla-profiles/gfycat-companion"
        }
      },

      "run_mobile": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": MOBILE_DIR,
          "command": "run",
          "arguments": "-a fennec-on-device -b adb --mobile-app firefox --force-mobile"
        }
      },

      "test_desktop": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": DESKTOP_DIR,
          "command": "test",
          "arguments": "-p ~/mozilla-profiles/gfycat-companion --static-args={\"testPage\":\"http://mr-andersen.no/gfcycat-companion-test/index.html\"}"
        }
      },

      "test_mobile": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": MOBILE_DIR,
          "command": "test",
          "arguments": "-a fennec-on-device -b adb --mobile-app firefox --force-mobile"
        }
      }
    },

    "mozilla-cfx-xpi": {
      "release_desktop": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": DESKTOP_DIR,
          "dist_dir": DIST_DIR + "/desktop"
        }
      },
      "release_mobile": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": MOBILE_DIR,
          "dist_dir": DIST_DIR + "/mobile",
          "arguments": "--force-mobile"

        }
      }
    },

    "copy": {
      "shared": {
        "files": [
          { "expand": true, "flatten": true, "src": [SHARED_DIR + "/*.js"], "dest": DESKTOP_DIR + "/lib/" },
          { "expand": true, "flatten": true, "src": [SHARED_DIR + "/*.js"], "dest": MOBILE_DIR + "/lib/" },
          { "expand": true, "flatten": true, "src": [SHARED_DIR + "/images/*.png"], "dest": DESKTOP_DIR + "/data/images/" },
          { "expand": true, "flatten": true, "src": [SHARED_DIR + "/images/*.png"], "dest": MOBILE_DIR + "/data/images/" },
          { "expand": true, "flatten": true, "src": [SHARED_DIR + "/test/lib/*.js"], "dest": DESKTOP_DIR + "/test/lib/" },
          { "expand": true, "flatten": true, "src": [SHARED_DIR + "/test/lib/*.js"], "dest": MOBILE_DIR + "/test/lib/" }
        ]
      }
    },

    "jshint": {
      "options": {
        "moz": true,
        "esnext": true,
        "curly": true,
        "eqeqeq": false,
        "eqnull": true,
        "globals": {
        },
      },
      "files": ["Gruntfile.js", DESKTOP_DIR + "/**/*.js", MOBILE_DIR + "/**/*.js"]
    },

    "clean": FILES_TO_REMOVE

  });

  grunt.registerTask("default", [
    "copy:shared",
    "mozilla-cfx:run_desktop"
  ]);

  grunt.registerTask("run_mobile", [
    "copy:shared",
    "mozilla-cfx:run_mobile"
  ]);

  grunt.registerTask("test_desktop", [
    "copy:shared",
    "mozilla-cfx:test_desktop"
  ]);
  
  grunt.registerTask("test_mobile", [
    "copy:shared",
    "mozilla-cfx:test_mobile"
  ]);
  
  grunt.registerTask("lint", [
    "copy:shared",
    "jshint"
  ]);

  grunt.registerTask("release", [
    "copy:shared",
    "jshint",
    "mozilla-cfx-xpi:release_desktop",
    "mozilla-cfx-xpi:release_mobile",
  ]);

};