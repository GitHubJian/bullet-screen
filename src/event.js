function event() {
  this.listeners = {}
}

event.prototype.on = function(event, callback, scope) {
  if (void 0 !== this.listeners[event]) {
    this.listeners[event].push({
      scope: scope,
      callback: callback
    })
  } else {
    this.listeners[event] = [
      {
        scope: scope,
        callback: callback
      }
    ]
  }
}

event.prototype.off = function(event, callback, scope) {
  if (void 0 !== this.listeners[event]) {
    var len = this.listeners[event].length
    var listener = []
    var i = 0

    for (; i < len; i++) {
      var data = this.listeners[event][i]
      if (!(data.scope === scope && data.callback === callback)) {
        listener.push(data)
      }
    }

    this.listener[event] = listener
  }
}

event.prototype.dispatch = function(event, args) {
  if (void 0 !== this.listeners[event]) {
    var i = 0,
      len = this.listeners[event].length

    for (; i < len; i++) {
      var subscription = this.listeners[event][i]
      if (subscription && subscription.callback) {
        subscription.callback.apply(subscription.scope, [event, args])
      }
    }
  }
}

export default event
