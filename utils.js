var client,
    redis_client;

var utils = {};

utils.rank = function(source, prefix, to) {
  redis_client.hgetall(source, function(error, reply) {
    var users = Object.keys(reply);
    users.sort(function(a, b) {
      return reply[b] - reply[a];
    });
    users = users.splice(0, 10).map(function(k) {
      return k + ": " + reply[k];
    }).join(', ');
    client.say(to, prefix + ": " + users);
  });
};


utils.makeRank = function(name, title) {
  return function(nick, to, args, message) {
    return utils.rank(name, title, to);
  };
};


utils.percent = function(num, den, message, who, to) {
  redis_client.hget(num, who, function(error, reply) {
    var num = +reply;
    redis_client.hget(den, who, function(error, reply) {
      var den = +reply;
      var pct = (100 * num / den).toPrecision(3);
      client.say(to, who + "'s " + message + ": " + pct + "%");
    });
  });
};

utils.makePercent = function(num, den, message) {
  return function(nick, to, args) {
    var who = args.length ? args[0] : nick;
    return utils.percent(num, den, message, who, to);
  };
};

module.exports = function(client_, redis_client_) {
  client = client_;
  redis_client = redis_client_;
  return utils;
};
