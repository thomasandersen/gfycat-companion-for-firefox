module.exports = function(grunt) {
  
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
          "extension_dir": "desktop",
          "command": "run",
          "arguments": "-p ~/mozilla-profiles/gfycat-companion"
        }
      },
      "run_mobile": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": "mobile",
          "command": "run",
          "arguments": "-a fennec-on-device -b adb --mobile-app firefox --force-mobile"
        }
      },
      "test_desktop": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": "desktop",
          "command": "test",
          "arguments": "-p ~/mozilla-profiles/gfycat-companion --static-args='{\"testPage\":\"http://mr-andersen.no/gfcycat-companion-test/index.html\"}'"
        }
      }
    },

    "mozilla-cfx-xpi": {
      "release_desktop": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": "desktop",
          "dist_dir": "dist/desktop"
        }
      },
      "relase_mobile": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": "mobile",
          "dist_dir": "dist/mobile",
          "arguments": "--force-mobile"

        }
      }
    },

    "copy": {
      "shared": {
        "files": [
          { "expand": true, "flatten": true, "src": ["shared/*.js"], "dest": "desktop/lib/" },
          { "expand": true, "flatten": true, "src": ["shared/*.js"], "dest": "mobile/lib/" },
          { "expand": true, "flatten": true, "src": ["shared/images/*.png"], "dest": "desktop/data/images/" },
          { "expand": true, "flatten": true, "src": ["shared/images/*.png"], "dest": "mobile/data/images/" }
        ]
      }
    },

  });
  grunt.loadNpmTasks("grunt-mozilla-addon-sdk");
  grunt.loadNpmTasks("grunt-contrib-copy");

  grunt.registerTask("default", [
    "copy:shared",
    "mozilla-cfx:run_desktop"
  ]);

};