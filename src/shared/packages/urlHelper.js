let Request = require("sdk/request").Request;

exports.getDomainForHost = (host) => {
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

exports.asyncIsContentTypeGif = (url, isGifCallback, isNotGifCallback) => {
  Request({
    url: url,
    onComplete: (response) => {
      let contentType = response.headers["Content-Type"];
      if (contentType.toLowerCase().contains("gif")) {
        console.log("Is gif content type, " + url);
        isGifCallback();
      } else {
        console.log("Is not gif content type, " + url);
        isNotGifCallback();
      }
    }
  }).head();
};