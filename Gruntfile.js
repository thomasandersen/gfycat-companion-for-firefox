module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-mozilla-addon-sdk");
  grunt.loadNpmTasks("grunt-contrib-copy");

  var profile = grunt.option("profile") || "~/mozilla-profiles/gfycat-companion";

  grunt.initConfig({
    "desktopPkg": grunt.file.readJSON("src/desktop/package.json"),
    "mobilePkg": grunt.file.readJSON("src/mobile/package.json"),
    "dirs": {
      "shared": "src/shared",
      "desktop": "src/desktop",
      "mobile": "src/mobile",
      "dist": "dist"
    },

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
          "extension_dir": "<%= dirs.desktop %>",
          "command": "run",
          "pipe_output": true,
          "arguments": "-p " + profile
        }
      },

      "run_mobile": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": "<%= dirs.mobile %>",
          "command": "run",
          "pipe_output": true,
          "arguments": "-a fennec-on-device -b adb --mobile-app firefox --force-mobile"
        }
      },

      "test_desktop": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": "<%= dirs.desktop %>",
          "command": "test",
          "pipe_output": true,
          "arguments": "-p " + profile
        }
      },

      "test_mobile": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": "<%= dirs.mobile %>",
          "command": "test",
          "pipe_output": true,
          "arguments": "-a fennec-on-device -b adb --mobile-app firefox --force-mobile"
        }
      }
    },

    "mozilla-cfx-xpi": {
      "release_desktop": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": "<%= dirs.desktop %>",
          "dist_dir": "<%= dirs.dist %>/desktop"
        }
      },
      "release_mobile": {
        "options": {
          "mozilla-addon-sdk": "1_15",
          "extension_dir": "<%= dirs.mobile %>",
          "dist_dir": "<%= dirs.dist %>/mobile",
          "arguments": "--force-mobile"

        }
      }
    },

    "copy": {
      "shared": {
        "files": [
          { "expand": true, "flatten": true, "src": "<%= dirs.shared %>/shared-packages/*.js", "dest": "<%= dirs.desktop %>/lib/packages/" },
          { "expand": true, "flatten": true, "src": "<%= dirs.shared %>/shared-packages/*.js", "dest": "<%= dirs.mobile %>/lib/packages/" },
          { "expand": true, "flatten": true, "src": "<%= dirs.shared %>/images/*.png", "dest": "<%= dirs.desktop %>/data/images/" },
          { "expand": true, "flatten": true, "src": "<%= dirs.shared %>/images/*.png", "dest": "<%= dirs.mobile %>/data/images/" },
          { "expand": true, "flatten": true, "src": "<%= dirs.shared %>/test/lib/*.js", "dest": "<%= dirs.desktop %>/test/lib/" },
          { "expand": true, "flatten": true, "src": "<%= dirs.shared %>/test/lib/*.js", "dest": "<%= dirs.mobile %>/test/lib/" }
        ]
      },
      "release": {
        "files": [
          {
            "src": "<%= dirs.dist %>/desktop/<%= desktopPkg.name %>.xpi",
            "dest": "<%= dirs.dist %>/desktop/<%= desktopPkg.name %>-<%= desktopPkg.version %>.xpi"
          },
          {
            "src": "<%= dirs.dist %>/mobile/<%= mobilePkg.name %>.xpi",
            "dest": "<%= dirs.dist %>/mobile/<%= mobilePkg.name %>-<%= mobilePkg.version %>.xpi"
          },
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
      "files": [
        "Gruntfile.js", 
        "<%= dirs.desktop %>/**/*.js", 
        "<%= dirs.mobile %>/**/*.js",
        "!<%= dirs.desktop %>/chrome/**/*.js"
      ]
    }

  });

  grunt.registerTask("default", "run_desktop");

  grunt.registerTask("run_desktop", [
    "copy:shared",
    "jshint",
    "mozilla-cfx:run_desktop"
  ]);

  grunt.registerTask("run_mobile", [
    "copy:shared",
    "jshint",
    "mozilla-cfx:run_mobile"
  ]);

  grunt.registerTask("test_desktop", [
    "copy:shared",
    "jshint",
    "mozilla-cfx:test_desktop"
  ]);
  
  grunt.registerTask("test_mobile", [
    "copy:shared",
    "jshint",
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
    "copy:release"
  ]);

};