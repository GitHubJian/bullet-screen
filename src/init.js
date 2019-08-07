import A from './a.js'
import Matrix from './matirx.js'
import result from './result.js'
import f from './f.js'
import Model from './model.js'

function init(s) {
  this.b = s

  this.i = new A()

  this.g = new A()

  this.V = new Matrix(this.ka)

  this.la = {
    1: new result(s),
    4: new f(s),
    5: new Model(s)
  }

  this.H = 0
}

init.prototype.constructor = init

init.prototype.ka = function(a, b) {
  return a.o - b.o
}

init.prototype.add = function(name) {
  name = new function(options) {
    this.o = options.stime
    this.text = options.text
    this.mode = options.mode
    this.size = options.size
    this.color = options.color
    this.wa = options.date
    this.border = options.border || false
    this.borderColor = options.borderColor || 0

    this.on = false
  }(name)

  if (this.b.N) {
    this.J(name)
  } else {
    this.i.push(name)
    this.V.D(name)
    if (name.border) {
      this.J(name)
    }
  }
}

init.prototype.Ka = function(i) {
  if (((i = i - 0.001), 3 < Math.abs(this.H - i))) {
    this.aa()
  } else {
    var _sizeAnimateTimeStamps = this.V.Ca(
      {
        o: this.H
      },
      {
        o: i
      }
    )

    for (; _sizeAnimateTimeStamps.length; ) {
      this.J(_sizeAnimateTimeStamps.shift())
    }
  }

  this.H = i
}

init.prototype.oa = function(extra) {
  return !!extra.border || !(this.g.length >= this.b.R)
}

init.prototype.J = function(c) {
  if (!c.on && this.oa(c)) {
    var next = this.la[c.mode]
    if (next) {
      var a = next.ua(c)
      next.P(a)
      c.on = true
      this.g.push(a)
    }
  }
}

init.prototype.T = function(a) {
  a.f.on = false
  a.t.O(a)
  this.g.remove(a)
}

init.prototype.aa = function() {
  for (; this.g.length; ) {
    this.T(this.g[0])
  }
}

init.prototype.Ma = function(t) {
  var mLen = this.g.length
  var el = []
  var i = 0
  for (; i < mLen; i++) {
    var o = this.g[i]
    if (o.t.update(o, t)) {
      this.b.u(o, o.K, o.L, this.b)
    } else {
      el.push(o)
    }
  }

  mLen = el.length
  i = 0
  for (; i < mLen; i++) {
    o = el[i]
    this.T(o)
  }
}

export default init
