function Delayer() {
  this.queue = [];
}

Delayer.prototype.delay = function(f) {
  this.queue.push(f);
};

Delayer.prototype.run = function() {
  this.queue.forEach(function(f) {
    f();
  });
};

module.exports = {
  Delayer: Delayer
};
