// var URI_ROOT = 'https://us-central1-poll-counters.cloudfunctions.net/';
var URI_ROOT = 'http://localhost:5000/poll-counters/us-central1/';
var GROUP_ERROR = 'A group name is required to create a Client';
var QUERY_ERROR = 'Missing query parameter';
var NOOP = function() {};

function request(path, cb) {
  var xhr = new XMLHttpRequest();

  xhr.onabort = cb || NOOP;
  xhr.onerror = cb || NOOP;
  xhr.onload = cb
    ? function(event) {
        var response;

        if (xhr.status !== 200) {
          return cb(event);
        }

        try {
          response = JSON.parse(xhr.responseText);
        } catch (e) {}

        cb(response ? response.error || null : xhr.responseText, response.error ? null : response);
      }
    : NOOP;
  xhr.open('GET', URI_ROOT + path + (cb ? '' : '&quiet=1'));
  xhr.responseType = 'text';
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
