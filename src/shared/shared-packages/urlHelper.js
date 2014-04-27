let Request = require("sdk/request").Request;
/**
 * @param {string} aHost
 * @returns {string}
 */
exports.getDomainForHostName = (aHost) => {
  return aHost.split(".").slice(-2).join('.');
};

/**
 * @param {string} aUrl
 * @returns {string}
 */
exports.getFileExtension = (aUrl) => {
  return aUrl.split(".").pop().replace(/[#\?].*/gi, "");
};

/**
 * @param {string} aUrl
 * @returns {boolean}
 */
exports.isGifFileExtension = (aUrl) => {
  return /\.gif.*$/i.test(aUrl);
};

/**
 * @param {string} aUrl
 * @returns {boolean}
 */
exports.isImageFileExtension = (aUrl) => {
  return /\.(gif|jpg|jpeg|png).*$/i.test(aUrl);
};

/**
 * @param {string} aParamName
 * @param {string} aParamValue
 * @param {string} aUrl
 */
exports.addParameterToUrl = (aParamName, aParamValue, aUrl) => {
  let urlWithParam = !aUrl.contains("?") ? aUrl + "?" : aUrl + "&";
  urlWithParam += (aParamName + "=" + String(aParamValue));
  return urlWithParam;
};

/**
 * @param {string} url
 * @param {function} isGifCallback
 * @param {function} isNotGifCallback
 */
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