gfycat Companion for Firefox desktop and mobile
===

Hacking
---

The following tools needs to be installed before getting started.

* [Node.js](http://nodejs.org/)
* [Grunt](http://gruntjs.com/)
* [Android SDK](http://developer.android.com/sdk/index.html) - for mobile development.

Make sure ```adb``` (Android Debug Bridge) is in the $path.

1. Clone this repo
2. In the root folder type ```npm install```. This will install the needed tools for building.
3. Available ```grunt``` tasks:
  * ```grunt run_mobile``` - Starts a new mobile browser instance.
  * ```grunt test_desktop``` - Runs browser tests.
  * ```grunt test_mobile``` - Runs mobile browser tests.
  * ```grunt release``` - Exports the .xpi's to the dist folder.
  * ```grunt lint``` - Runs jshint against the project's JavaScript files.

The default grunt task starts a new browser instance with the add-on installed

Icon by gfycat.com

Other solutions
---

Chrome:
* https://github.com/Imdsm/AutoGfy
* https://github.com/engstrom/GfyFetcher
* https://github.com/STRML/Imgur-to-Gfycat