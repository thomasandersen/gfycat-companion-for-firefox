exports.getFileExtension = (url) => {
  return url.split('.').pop();
};

exports.urlEndsWithDotGif = (url) => {
  return /\.gif.*$/.test(url);
};
