var URI_ROOT =
  window.location.search.indexOf('dev') > -1
    ? 'http://localhost:5000/poll-counters/us-central1/'
    : 'https://us-central1-poll-counters.cloudfunctions.net/';
var GROUP_ERROR = 'A group name is required to create a Client';
var QUERY_ERROR = 'Missing query parameter';
var NOOP = function() {};

function request(functionName, data, cb) {
  if (!cb) {
    data.quiet = 1;
  }

  if (data.quiet && 'sendBeacon' in navigator) {
    return navigator.sendBeacon(URI_ROOT + functionName, JSON.stringify(data));
  }

  var query = Object.keys(data).reduce(function(memo, propName) {
    var value = data[propName];

    if (value == null) {
      return memo;
    }

    return memo + (memo.length ? '&' : '?') + propName + '=' + value;
  }, '');
  var xhrURL = URI_ROOT + functionName + query;
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
  xhr.open('GET', xhrURL);
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
    'get',
    {
      group: this.group,
      question: query.question,
      answer: query.answer
    },
    cb
  );
};

Client.prototype.increment = function(query, cb) {
  if (typeof query !== 'object' || !query.question || !query.answer) {
    throw new Error(QUERY_ERROR);
  }

  request(
    'increment',
    {
      group: this.group,
      question: query.question,
      answer: query.answer
    },
    cb
  );
};

module.exports.Client = Client;
