import Node from './node.js'

function Timer(s) {
  debugger
  this.b = s
}

Timer.prototype.constructor = Timer

Timer.prototype.ua = function(ast) {
  debugger
  return new Node(ast, this.b)
}

Timer.prototype.P = null

Timer.prototype.O = null

Timer.prototype.update = null

export default Timer
