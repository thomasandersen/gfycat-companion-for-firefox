let Request = require("sdk/request").Request;

exports.getDomainForHostName = (host) => {
  return host.split(".").slice(-2).join('.');
};

exports.getFileExtension = (url) => {
  return url.split(".").pop().replace(/[#\?].*/gi, "");
};

exports.isGifFileExtension = (url) => {
  return /\.gif.*$/i.test(url);
};

exports.isImageFileExtension = (url) => {
  return /\.(gif|jpg|jpeg|png).*$/i.test(url);
};

exports.addParameterToUrl = (paramName, paramValue, url) => {
  let urlWithParam = !url.contains("?") ? url + "?" : url + "&";
  urlWithParam += (paramName + "=" + String(paramValue));
  return urlWithParam;
};

exports.asyncIsContentTypeGif = (url, isGifCallback, isNotGifCallback) => {
  Request({
    url: url,
    onComplete: (response) => {
      let contentType = response.headers["Content-Type"];
      if (contentType.toLowerCase().contains("gif")) {
        console.log("Content type is gif, " + url);
        isGifCallback();
      } else {
        console.log("Content type is not gif, " + url);
        isNotGifCallback();
      }
    }
  }).head();
};