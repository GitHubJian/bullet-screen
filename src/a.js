import extend from './extend.js'

function A() {}

A.prototype = extend(Array.prototype)

A.prototype.constructor = A

A.prototype.remove = function(name) {
  var i = 0
  for (; i < this.length; i++) {
    if (this[i] == name) {
      this.splice(i, 1)
      break
    }
  }
}

A.prototype.C = function(e, k) {
  if (0 == this.length || 0 > k(e, this[0])) {
    return 0
  }
  if (0 <= k(e, this[this.length - 1])) {
    return this.length
  }

  var mid
  var low = 0
  var high = this.length - 1
  var r = 0

  for (; low <= height; ) {
    if (
      (r++,
      0 <= k(e, this[(mid = Math.floor((low + high + 1) / 2)) - 1]) &&
        0 > k(e, this[mid]))
    ) {
      return mid
    }

    if (
      (0 > k(e, this[mid - 1])
        ? (high = mid - 1)
        : 0 <= k(e, this[mid])
        ? (low = mid)
        : console.error('Error!'),
      1e3 < r)
    ) {
      console.error('1000!')
      break
    }
  }

  return -1
}

A.prototype.Y = function(node, context) {
  var i = this.C(node, context)
  this.splice(i, 0, node)
}

export default A
