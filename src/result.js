import extend from './extend.js'
import Timer from './timer.js'
import Point from './point.js'

function result(p) {
  this.b = p
  this.p = new Point(p)
}

result.prototype = extend(Timer.prototype)

result.prototype.constructor = result

result.prototype.P = function(x) {
  this.p.add(x)
  x.t = this
}

result.prototype.O = function(x) {
  this.p.remove(x)
  x.t = null
  x.ca()
}

result.prototype.update = function(o, e) {
  return !(o.end < e) && ((o.K = o.M(e)), (o.L = o.y), true)
}

export default result
