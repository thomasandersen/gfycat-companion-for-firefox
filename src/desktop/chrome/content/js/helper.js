var Helper = {
  getURLParameter: function(aName) {
    return decodeURI(
      (RegExp(aName + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
  },

  createPsudoRandomStr: function(aStringLength) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0; i < aStringLength; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },

  requestFullscreen: function(aElem) {
    if (aElem.requestFullscreen) {
      aElem.requestFullscreen();
    } else if (aElem.mozRequestFullScreen) {
      aElem.mozRequestFullScreen();
    } else {
      console.warn("Fullscreen is not supported by this device.");
    }
  }
};

var DomHelper = {
  findParentBySelector: function(aElem, aSelector) {
    var all = document.querySelectorAll(aSelector);
    var current = aElem.parentNode;
    while(current && !this._collectionHas(all, current)) {
      current = current.parentNode; //go up
    }
    return current;
  },

  _collectionHas: function(a, b) {
    for(var i = 0, len = a.length; i < len; i ++) {
      if(a[i] == b) {
        return true;
      }
    }
    return false;
  }

};