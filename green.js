var redis_client,
    client,
    reloader,
    utils,
    delayer = new (require('./delayer').Delayer);

var commands = {};

function rank(source, prefix, to) {
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
}

delayer.delay(function() {
  commands.greentop = utils.makeRank("greentext", "Most greentext");
  commands.greenpct = utils.makePercent("greentext", "lines", "percentage of greentext");
});

/*function(nick, to, args, message) {
  rank("greentext", "Most greentext", to);
};*/

commands.reload = function(nick, to, args, message) {
  delete require.cache[require.resolve('./green')];
  var obj = require('./green')(client, redis_client, reloader);
  reloader(obj);
};

module.exports = function(client_, redis_client_, reloader_) {
  client = client_;
  redis_client = redis_client_;
  utils = require('./utils')(client, redis_client);
  delayer.run();
  reloader = reloader_;
  return commands;
};
