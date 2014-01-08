exports.getDomain = (host) => {
  return host.split(".").slice(-2).join('.');
};

exports.getFileExtension = (url) => {
  return url.split(".").pop();
};

exports.urlEndsWithDotGif = (url) => {
  return /\.gif.*$/.test(url);
};
