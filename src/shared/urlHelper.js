exports.getDomain = (host) => {
  return host.split(".").slice(-2).join('.');
};

exports.getFileExtension = (url) => {
  return url.split(".").pop().replace(/[#\?].*/gi, "");
};

exports.isGif = (url) => {
  return /\.gif.*$/i.test(url);
};

exports.isImage = (url) => {
  return /\.(gif|jpg|jpeg|png).*$/i.test(url);
};

exports.addParameterToUrl = (paramName, paramValue, url) => {
  let urlWithParam = !url.contains("?") ? url + "?" : url + "&";
  urlWithParam += (paramName + "=" + String(paramValue));
  return urlWithParam;
};  