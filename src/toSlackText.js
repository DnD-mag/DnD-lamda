const markdown = require("marked");
const striptags = require("striptags");
const renderer = new markdown.Renderer();

function toSlackText(str) {
  const html = renderer(str);
  [text => striptags(text, "<strong>", "*")];
}
