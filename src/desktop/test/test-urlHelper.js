let urlHelper = require("packages/urlHelper");
let Url = require("sdk/url").URL;

exports["test domain should be extractred from url"] = function(assert, done) {
  assert.equal(urlHelper.getDomainForHost(new Url("http://cdn3.sbnation.com/").host), "sbnation.com", "Domain should be extractred from url");
  assert.equal(urlHelper.getDomainForHost(new Url("http://i.imgur.com").host), "imgur.com", "Domain should be extractred from url");
  assert.equal(urlHelper.getDomainForHost(new Url("http://24.media.tumblr.com/").host), "tumblr.com", "Domain should be extractred from url");
  assert.equal(urlHelper.getDomainForHost(new Url("http://usatthebiglead.files.wordpress.com").host), "wordpress.com", "Domain should be extractred from url");
  assert.equal(urlHelper.getDomainForHost(new Url("http://media2.giphy.com/media/FWbnuDAY0XrTq/giphy.gif").host), "giphy.com", "Domain should be extractred from url");
  done();
};

exports["test get file extension from url"] = function(assert, done) {
  assert.equal(urlHelper.getFileExtension("http://i.minus.com/iJEuFMVd3l0AU.gif"), "gif", "File extension should be gif");
  assert.equal(urlHelper.getFileExtension("http://i.imgur.com/Ae1ehbK.png"), "png", "File extension should be png");
  assert.equal(urlHelper.getFileExtension("http://i.imgur.com/Cc7fEMH.jpg"), "jpg", "File extension should be jpg");
  assert.equal(urlHelper.getFileExtension("http://i.minus.com/iJEuFMVd3l0AU.gif?param=1"), "gif", "File extension should be gif");
  assert.equal(urlHelper.getFileExtension("http://i.minus.com/iJEuFMVd3l0AU.gif?param1=1&param2=2#top"), "gif", "File extension should be gif");
  assert.equal(urlHelper.getFileExtension("http://i.minus.com/iJEuFMVd3l0AU.jpg#xyz"), "jpg", "File extension should be jpg");
  done();
};

exports["test file should be gif"] = function(assert, done) {
  assert.equal(urlHelper.isGif("http://i.minus.com/iJEuFMVd3l0AU.gif"), true, "File should be gif");
  assert.equal(urlHelper.isGif("http://i.imgur.com/Ae1ehbK.png"), false, "File should not be gif");
  assert.equal(urlHelper.isGif("http://i.imgur.com/Cc7fEMH.jpg"), false, "File should not be gif");
  assert.equal(urlHelper.isGif("http://i.minus.com/iJEuFMVd3l0AU.gif?param=1"), true, "File should be gif");
  assert.equal(urlHelper.isGif("http://i.minus.com/iJEuFMVd3l0AU.gif?param=1&ost=3#top"), true, "File should be gif");
  assert.equal(urlHelper.isGif("http://i.minus.com/iJEuFMVd3l0AU.gif#goto=2"), true, "File should be gif");
  done();
};

exports["test file should be an image type"] = function(assert, done) {
  assert.equal(urlHelper.isImage("http://i.minus.com/iJEuFMVd3l0AU.gif"), true, "File should be a image");
  assert.equal(urlHelper.isImage("http://i.imgur.com/Ae1ehbK.png"), true, "File should be a image");
  assert.equal(urlHelper.isImage("http://i.imgur.com/Cc7fEMH.jpg"), true, "File should be a image");
  assert.equal(urlHelper.isImage("http://i.minus.com/iJEuFMVd3l0AU.gif?param=1"), true, "File should be a image");
  assert.equal(urlHelper.isImage("http://i.minus.com/iJEuFMVd3l0AU.png?param=1&ost=3#top"), true, "File should be a image");
  assert.equal(urlHelper.isImage("http://i.minus.com/iJEuFMVd3l0AU.jpg#goto=2"), true, "File should be a image");
  done();
};

exports["test parameter should be added to url"] = function(assert, done) {
  assert.equal(urlHelper.addParameterToUrl("flag", "1", "http://i.imgur.com/xyz.gif"), "http://i.imgur.com/xyz.gif?flag=1", "Parameter should be added to url properly");
  assert.equal(urlHelper.addParameterToUrl("key", "58473", "http://i.imgur.com/xyz.gif?flag=1"), "http://i.imgur.com/xyz.gif?flag=1&key=58473", "Parameter should be added to url properly");
  done();
};

require("sdk/test").run(exports);