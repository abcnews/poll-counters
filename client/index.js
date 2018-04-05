const xhr = require('xhr');

const URI_ROOT = `https://us-central1-poll-counters.cloudfunctions.net/`;
const GROUP_ERROR = `A group name is required to create a Client`;
const QUERY_ERROR = `Missing query parameter`;

const request = (path, cb) =>
  xhr(
    {
      method: 'get',
      uri: `${URI_ROOT}${path}`,
      json: true
    },
    (err, resp, body) => cb(err, body)
  );

class Client {
  constructor(group) {
    if (!group) {
      throw new Error(GROUP_ERROR);
    }

    this.group = group;
  }

  get({ question, answer } = {}, cb) {
    if (typeof arguments[0] === 'function') {
      cb = arguments[0];
    }

    request(
      `get?group=${this.group}${question ? `&question=${question}${answer ? `&answer=${answer}` : ''}` : ''}`,
      cb
    );
  }

  increment({ question, answer } = {}, cb) {
    if (!question || !answer) {
      throw new Error(QUERY_ERROR);
    }

    request(`increment?group=${this.group}&question=${question}&answer=${answer}`, cb);
  }
}

module.exports.Client = Client;
