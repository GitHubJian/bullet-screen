import extend from './extend.js'
import Timer from './timer.js'
import Promise from './promise.js'

function f(value) {
  this.b = value
  this.p = new Promise(value)
}

f.prototype = extend(Timer.prototype)

f.prototype.constructor = f

f.prototype.P = function(x) {
  this.p.add(x)
  x.t = this
}

f.prototype.O = function(x) {
  this.p.remove(x)
  /** @type {null} */
  x.t = null
  x.ca()
}

f.prototype.update = function(options, date) {
  return (
    !(options.end < date) &&
    ((options.K = options.x),
    (options.L = this.b.height - options.y - options.height),
    true)
  )
}

export default f
