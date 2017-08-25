const request = require('request');

const markdownRenderer = require('./markdown.js');

const API_URL = 'https://api.medium.com/v1/';
const USER_ID = '1ba8d8d58b53b42ef487c513aa367e81cb418e4fd28539ed12d979c03798b227b';
const PUBLICATION_ID = 'dad3c6645e76';


const createPostWithPublication = (authorization) => (body, options = {}) => {
  const mediumSetting = Object.assign(body, {
    contentFormat: 'html',
    publishStatus: 'draft',
    license: 'all-rights-reserved',
    notifyFollowers: false
  });

  return new Promise((resolve, reject) => {
    markdownRenderer(body.content)
      .then(content => {
        request({
          url:  API_URL + 'publications/' + PUBLICATION_ID + '/posts',
          headers: {
            'Authorization': 'Bearer ' + authorization
          },
          method: 'POST',
          json: Object.assign(mediumSetting, { content: `<h1>${body.title}</h1> ${content}` })
        }, (err, res, body) => err ? reject(err) : resolve(body))
      })
  })
}

module.exports = createPostWithPublication
