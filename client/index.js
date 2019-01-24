var URI_ROOT = 'https://us-central1-poll-counters.cloudfunctions.net/';
var GROUP_ERROR = 'A group name is required to create a Client';
var QUERY_ERROR = 'Missing query parameter';

function request(path, cb) {
  var xhr = new XMLHttpRequest();

  xhr.onabort = cb;
  xhr.onerror = cb;
  xhr.onload = function(event) {
    cb(xhr.status !== 200 ? event : null, JSON.parse(xhr.responseText));
  };
  xhr.open('GET', URI_ROOT + path);
  xhr.send();
}

function Client(group) {
  if (!(this instanceof Client)) {
    return new Client(group);
  }

  if (!group) {
    throw new Error(GROUP_ERROR);
  }

  this.group = group;
}

Client.prototype.get = function(query, cb) {
  if (typeof query === 'function') {
    cb = query;
  }

  if (typeof query !== 'object') {
    query = {};
  }

  request(
    'get?group=' +
      this.group +
      (query.question ? '&question=' + query.question + (query.answer ? '&answer=' + query.answer : '') : ''),
    cb
  );
};

Client.prototype.increment = function(query, cb) {
  if (typeof query !== 'object' || !query.question || !query.answer) {
    throw new Error(QUERY_ERROR);
  }

  request('increment?group=' + this.group + '&question=' + query.question + '&answer=' + query.answer, cb);
};

module.exports.Client = Client;
