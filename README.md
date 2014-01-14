gfycat Companion for Firefox desktop and mobile
===

Hacking
---

The following tools must be installed before getting started.

* [Node.js](http://nodejs.org/)
* [Grunt](http://gruntjs.com/)
* [Android SDK](http://developer.android.com/sdk/index.html) - for mobile development.

Make sure ```adb``` (Android Debug Bridge) is available in $path.

1. Clone this repo
2. In the root folder type ```npm install```. This will install the required node modules for the grunt tasks.
3. Available ```grunt``` tasks:
  * ```grunt run_desktop``` - Default. Runs the add-on in a new desktop browser instance (see instructions below for using a browser profile).
  * ```grunt run_mobile``` - Runs the add-on in a new mobile browser instance.
  * ```grunt test_desktop``` - Runs browser tests.
  * ```grunt test_mobile``` - Runs mobile browser tests.
  * ```grunt lint``` - Runs jshint against the project's JavaScript files.
  * ```grunt release``` - Exports the .xpi's to the dist folder.

By default, 'run' and 'test' tasks uses '~/mozilla-profiles/gfycat-companion' as browser profile. This ensures a clean development enviorment and protects the the default profile.
Add ```--profile=/path/to/profile-dir/``` argument to the task in order to run the tasks with another profile.

Eg.

```grunt run_desktop --profile=/path/to/profile-dir/ ```

Icon by gfycat.com

Other solutions
---

Chrome:
* https://github.com/Imdsm/AutoGfy
* https://github.com/engstrom/GfyFetcher
* https://github.com/STRML/Imgur-to-Gfycat