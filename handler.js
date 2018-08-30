"use strict";
require("dotenv").config();
const request = require("request");
const createPostWithPublication = require("./src/medium");

const successResponse = body => ({
  statusCode: 200,
  body: JSON.stringify(body)
});

const getIssueComments = commentsURL =>
  new Promise((resolve, reject) => {
    request(
      {
        url: commentsURL,
        headers: {
          "User-Agent": "kjj6198"
        }
      },
      (err, res, body) => (err ? reject(err) : resolve(JSON.parse(body)))
    );
  });

const serializeComments = comments =>
  comments.map(comment => comment.body).join("\n");

module.exports.uploadToMedium = (event, context, callback) => {
  const githubEvent = event.headers["X-GitHub-Event"];
  const body = JSON.parse(event.body);
  console.log("Event: ", JSON.stringify(event));

  if (githubEvent === "issues" && body.action === "closed") {
    const commentsURL = body.issue.comments_url;

    getIssueComments(commentsURL)
      .then(serializeComments)
      .then(serializedComments =>
        createPostWithPublication(process.env.MEDIUM_PUBLISH_KEY)({
          title: body.issue.title,
          content: body.issue.body + "\n" + serializedComments
        })
      )
      .then(body => {
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(body)
        });
      })
      .catch(err => callback(null, { body: JSON.stringify(err) }));
  } else {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        message: "bad request. Action not allow."
      })
    });
  }
};

module.exports.toSlack = (event, context, callback) => {
  const githubEvent = event.headers["X-GitHub-Event"];
  const body = JSON.parse(event.body);
  request.post(process.env.SLACK_WEBHOOK_URL, {
    body: JSON.stringify({
      username: body.issue.assignee && body.issue.assignee.login,
      text: body.issue.title,
      attachments: [
        {
          color: "good",
          author_name: body.issue.assignee && body.issue.assignee.login,
          author_link: body.issue.assignee.html_url,
          author_icon: body.issue.assignee.avatar_url,
          title: body.issue.title,
          title_link: body.issue.html_url,
          fields: [
            {
              title: "內容",
              value: 
            },
            {
              title: "主講",
              value: body.issue.assignee && body.issue.assignee.login,
              short: true
            }
          ],
          footer: body.issue.labels.map(l => l.name).join(", "),
          ts: Math.floor(new Date(body.issue.closed_at).getTime() / 1000)
        }
      ]
    })
  });

  callback(null, {
    statusCode: 200,
    body: "ok"
  });
};
