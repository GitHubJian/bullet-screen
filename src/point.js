import Promise from './promise.js'
import extend from './extend.js'

function Point(obj) {
  Promise.call(this, obj)
}

Point.prototype = extend(Promise.prototype)

Point.prototype.constructor = Point

Point.prototype.add = function(value) {
  value.x = this.b.width
  if (value.height >= this.b.height) {
    value.d(0, -1)
  } else {
    this.d(value, 0)
  }
}

Point.prototype.Q = function(y, a, k) {
  var y1 = y + a.height
  var o = a.x + a.width
  /** @type {number} */
  var pos = 0
  for (; pos < this.c[k].length; pos++) {
    var c = this.c[k][pos]
    if (!(c.y > y1 || c.bottom < y)) {
      if (!(c.Da(a.start) < a.x || c.M(a.start) > o)) {
        return false
      }
      if (!(c.end <= a.ea)) {
        return false
      }
    }
  }
  return true
}

export default Point
