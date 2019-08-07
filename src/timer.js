function Timer(s) {
  this.b = s
}

Timer.prototype = {
  constructor: Timer,
  ua: function(ast) {
    return new Node(ast, this.b)
  },
  P: null,
  O: null,
  update: null
}

export default Timer
