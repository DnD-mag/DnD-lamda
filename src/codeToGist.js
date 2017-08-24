const request = require('request');
const uuid    = require('node-uuid');


const getLangShortcut = (lang) => {
  switch(lang) {
    case 'javascript':
      return 'js'
    case 'ruby':
      return 'rb'
    default:
      return lang
  }
}

const codeToGist = (accessToken) => (lang, code, callback) => {
  request.post({
    url: 'https://api.github.com/gists',
    headers: {
      'User-Agent': 'user kjj6198',
      'Authorization': 'token ' + accessToken
    },
    json: {
      description: '',
      public: true,
      files: {
        [uuid.v1() + '.' + getLangShortcut(lang)]: {
          content: code
        }
      }
    }
  }, (err, response, body) => {
    if (err) { callback(err) }

    callback && callback(null, body.html_url)
  })
}

module.exports = codeToGist;
