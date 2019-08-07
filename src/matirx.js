import A from './a.js'

function Matrix(width) {
  this.w =
    width ||
    function(s, images) {
      return s - images
    }
}

Matrix.prototype = new A()

Matrix.prototype.constructor = Matrix

Matrix.prototype.D = function() {
  var i = 0
  for (; i < arguments.length; ) {
    this.Y(arguments[i], this.w)
    i++
  }
  return this
}

Matrix.prototype.remove = function(type) {
  var index = this.C(type, this.w)
  for (; 0 <= index; ) {
    if (this[index] === type) {
      return this.splice(index, 1), true
    }
    index--
  }
  return false
}

Matrix.prototype.Ba = function(from, to) {
  if (to <= from) {
    return []
  }

  var i = from
  var sortedSelection = []
  for (; i < to && i < this.length; ) {
    sortedSelection.push(this[i])
    i++
  }
  return sortedSelection
}

Matrix.prototype.Ca = function(e, n) {
  var angle = this.C(e, this.w)
  var x = this.C(n, this.w)

  return this.Ba(angle, x)
}

export default Matrix
