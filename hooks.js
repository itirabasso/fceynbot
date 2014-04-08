var request = require('request'),
    S       = require('string');

var client, redis_client, hooks = {};

hooks.karma = function(nick, to, text) {
  var i,
      person,
      increment,
      matches,
      karmaregex = /([a-zA-Z0-9_\-\\\[\]{}^`|]+)([: ]*)?(\+\+|--)/g;
  if (matches = text.match(karmaregex)) {
    for (i = 0; i < matches.length; ++i) {
      person = matches[i].slice(0, -2).trim();
      delta = matches[i].slice(-1) === '+' ? 1 : -1;
      person = person.replace(/[: ]*$/, '');
      if (person === nick) continue;
      redis_client.hincrby("karma", person, delta);
    }
  }
};

hooks.url = function(nick, to, text) {
  var urlregex = /http(s?):\/\/[^ \t]+/,
      titleregex = /<title>([^<]+)<\/title>/i;
  if (matches = text.match(urlregex)) {
    request(matches[0], function(error, response, body) {
      if (error) return console.log(error);
      var title = body.match(titleregex);
      if (title) {
        title = S(title[1]).decodeHTMLEntities().s.trim();
        client.say(to, "Title: " + title);
      }
    });
  }
};

module.exports = function(client_, redis_client_) {
  client = client_;
  redis_client = redis_client_;
  return hooks;
};
