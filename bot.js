var request = require('request');
var S = require('string');
var irc = require('irc');
var redis = require("redis"),
    redis_client = redis.createClient();

if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }

}
var client = new irc.Client('irc.freenode.net', 'aaa', {
  channels: ["#sss"],
  userName: "ccc",
  realName: "iii",
  nick: "iii",
  floodProtection: true,
});

var commands, green, hooks;
var reloader = function(obj) {
  commands = obj;
};

var greenreloader = function(obj) {
  green = obj;
};

var hookreloader = function(obj) {
  hooks = obj;
};

commands = require('./commands')(client, redis_client, reloader, hookreloader);
hooks = require('./hooks')(client, redis_client);

client.addListener('message', function(nick, to, text, message) {
  console.log("<" + nick + "> " + text);
  redis_client.hset("seen", nick, JSON.stringify({
    "date": new Date,
    "channel": to == client.opt.nick ? "private message" : to
  }));

  storeMessage(nick, text);

  redis_client.hincrby("lines", nick, 1);
  redis_client.hincrby("total_length", nick, text.length);
  redis_client.incr("total_lines");
  var cmd, cmds, args;
  if (text[0] == '!') {
    args = text.trim().substr(1).split(' ').map(function(x) {
      return x.trim();
    });
    cmd = args[0];
    args.shift();
    cmds = commands;
    if (cmd in cmds) {
      return cmds[cmd](nick, to, args, message);
    }
  }

  for (var hook in hooks) {
    hooks[hook](nick, to, text);
  }
});

function storeMessage(from, msg) {
  id = redis_client.incr('message_id');
  entry = {
    'time': Date.now(),
    'from': from,
    'message': msg
  };
  console.log(redis_client.zadd("messages", id, entry));
}

function nth(d) {
  if(d>3 && d<21) return 'th';
  switch (d % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}
