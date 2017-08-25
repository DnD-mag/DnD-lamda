'use strict';
require('dotenv').config();
const request = require('request');
const createPostWithPublication = require('./src/medium');


const successResponse = (body) => ({
  statusCode: 200,
  body: JSON.stringify(body)
});

const getIssueComments = (commentsURL) =>
  new Promise((resolve, reject) => {
    request({
      url: commentsURL,
      headers: {
        'User-Agent': 'kjj6198'
      }
    }, (err, res, body) => err ? reject(err) : resolve(JSON.parse(body)))
  })

const serializeComments = (comments) => comments.map(comment => comment.body).join('\n')

module.exports.uploadToMedium = (event, context, callback) => {
  const githubEvent = event.headers['X-GitHub-Event'];
  const body        = JSON.parse(event.body);
  console.log('Event: ', JSON.stringify(event));

  if (githubEvent === 'issues' && body.action === 'closed') {
    const commentsURL = body.issue.comments_url;

    getIssueComments(commentsURL)
      .then(serializeComments)
      .then(serializedComments => createPostWithPublication(process.env.MEDIUM_PUBLISH_KEY)({
        title: body.issue.title,
        content: body.issue.body + '\n' + serializedComments
      }))
      .then(body => {
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(body)
        })
      })
      .catch((err) => callback(null, { body: JSON.stringify(err) }))
  } else {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        message: 'bad request. Action not allow.'
      })
    })
  }
};
