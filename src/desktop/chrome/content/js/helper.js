var Helper = {
  getURLParameter: function(name) {
    return decodeURI(
      (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
  },

  createPsudoRandomStr: function(stringLength) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0; i < stringLength; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },

  requestFullscreen: function(el) {
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else {
      console.warn("Fullscreen is not supported by this device.");
    }
  }
};

var DomHelper = {
  findParentBySelector: function(el, selector) {
    var all = document.querySelectorAll(selector);
    var current = el.parentNode;
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