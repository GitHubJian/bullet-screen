import Promise from './promise.js'
import extend from './extend.js'
import A from './a.js'

function Point(obj) {
  Promise.call(this, obj)
}

Point.prototype = extend(Promise.prototype)

Point.prototype.constructor = Point

Point.prototype.add = function(t) {
  t.x = (this.b.width - t.width) / 2
  t.height >= this.b.height ? t.d(0, -1) : this.d(t, 0)
}

Point.prototype.remove = function(t) {
  ;-1 != t.index && void 0 != this.c[t.index] && this.c[t.index].remove(t)
}

Point.prototype.Q = function(t, e, n) {
  e = t + e.height
  for (var i = 0; i < this.c[n].length; i++) {
    var o = this.c[n][i]
    if (!(o.y > e || o.bottom < t)) return !1
  }
  return !0
}

Point.prototype.d = function(t, e) {
  var n = 0
  this.c.length <= e && this.c.push(new A())
  var i = this.c[e]
  if (0 == i.length) t.d(0, e), i.push(t)
  else if (this.Q(0, t, e)) t.d(0, e), this.D(i, t)
  else {
    for (
      var r = 0;
      r < i.length && !((n = i[r].bottom + 1) + t.height > this.b.height);
      r++
    )
      if (this.Q(n, t, e)) return t.d(n, e), void this.D(i, t)
    this.d(t, e + 1)
  }
}

Point.prototype.D = function(t, e) {
  t.Y(e, function(t, e) {
    return t.bottom - e.bottom
  })
}

export default Point
