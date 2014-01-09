self.on("click", function (node, data) {
  let link = node.nodeName.toLowerCase() == "a" ? node.href : node.src;
  self.postMessage(link);
  return true;
});