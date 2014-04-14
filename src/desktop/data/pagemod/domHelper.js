let Dom = {
  create: (tagName, attributes) => {
    let el = document.createElement(tagName);
    if (attributes) {
      for (let key in attributes) {
        el.setAttribute(key, attributes[key]);
      }
    }

    return el;
  },

  removeElem: (aElem) => {
    aElem.parentNode.removeChild(aElem);
  },

  insertBefore: (aElem, aReferenceElem) => {
    aReferenceElem.parentNode.insertBefore(aElem, aReferenceElem);
  }

};