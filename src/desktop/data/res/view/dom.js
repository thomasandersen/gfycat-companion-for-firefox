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

  removeNode: (node) => {
    node.parentNode.removeChild(node);
  }

};