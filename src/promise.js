import A from './a.js'

function Promise(arg) {
  this.b = arg

  this.c = []
}

Promise.prototype.constructor = Promise

Promise.prototype.add = function(name) {
  name.x = (this.b.width - name.width) / 2
  if (name.height >= this.b.height) {
    name.d(0, -1)
  } else {
    this.d(name, 0)
  }
}

Promise.prototype.remove = function(name) {
  if (-1 != name.index && void 0 != this.c[name.index]) {
    this.c[name.index].remove(name)
  }
}

Promise.prototype.Q = function(y, b, type) {
  b = y + b.height
  var i = 0
  for (; i < this.c[type].length; i++) {
    var child = this.c[type][i]
    if (!(child.y > b || child.bottom < y)) {
      return false
    }
  }

  return true
}

Promise.prototype.d = function(val, key) {
  var value = 0
  if (this.c.length <= key) {
    this.c.push(new A())
  }
  var items = this.c[key]
  if (0 == items.length) {
    val.d(0, key)
    items.push(val)
  } else {
    if (this.Q(0, val, key)) {
      val.d(0, key)
      this.D(items, val)
    } else {
      var i = 0
      for (
        ;
        i < items.length &&
        !((value = items[i].bottom + 1) + val.height > this.b.height);
        i++
      ) {
        if (this.Q(value, val, key)) {
          return val.d(value, key), void this.D(items, val)
        }
      }
      this.d(val, key + 1)
    }
  }
}

Promise.prototype.D = function(v, s) {
  v.Y(s, function(anchorAABB, aabb) {
    return anchorAABB.bottom - aabb.bottom
  })
}

export default Promise
