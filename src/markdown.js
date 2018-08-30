const markdown = require("marked");
const renderer = new markdown.Renderer();
const codeToGist = require("./codeToGist.js");
renderer.code = (code, lang) => code;

markdown.setOptions({
  highlight: function(code, lang, callback) {
    codeToGist(process.env.GITHUB_ACCESS_TOKEN)(lang, code, (err, url) => {
      callback(null, url);
    });
  }
});

const markdownRenderer = str => {
  return new Promise(resolve => {
    markdown(
      str,
      {
        renderer: renderer
      },
      (err, content) => {
        if (err) {
          throw err;
        }
        resolve(content);
      }
    );
  });
};

module.exports = markdownRenderer;
