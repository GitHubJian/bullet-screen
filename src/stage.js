import extend from './extend.js'
import init from './init.js'
import options from './options.js'
import Module from './module.js'

function Stage(d) {
  var i

  for (i in ((this.a = extend(options)), d)) {
    this.a[i] = d[i]
  }

  this.m = new init(this.a)
  this.paused = true
  this.I = 0
  this.S = 4294967296
  this.k = new Date().getTime()
  this.l = 0
  this.q = true
  var params = this
  window.setInterval(function() {
    params.ma()
    params.na()
  }, 1e3)
}

Stage.prototype.constructor = Stage

Stage.prototype.play = function() {
  this.paused = false

  this.l = this.I

  this.k = new Date().getTime()

  this.I = 0

  var query = this

  window.requestAnimationFrame(function() {
    query.U()
  })
}

Stage.prototype.pause = function() {
  this.paused = true

  this.I = this.l + new Date().getTime() - this.k
}

Stage.prototype.U = function() {
  var k = new Date().getTime()

  var barrierX = this.l + k - this.k

  if (this.a.j) {
    var coreX = 1e3 * this.a.j()
    if (1e3 < Math.abs(coreX - barrierX)) {
      this.l = barrierX = coreX
      this.k = k
    }
  } else {
    if (barrierX > this.S) {
      this.l = barrierX = 0
      this.k = k
    }
  }

  if (
    (null != this.m &&
      this.q &&
      (this.m.Ka(barrierX / 1e3),
      this.a.B && this.a.B(this.a),
      this.m.Ma(barrierX / 1e3)),
    !this.paused)
  ) {
    var query = this

    window.requestAnimationFrame(function() {
      query.U()
    })
  }
}

Stage.prototype.visible = Stage.prototype.ja = function(value) {
  return 0 == arguments.length
    ? this.q
    : (this.q != value && ((this.q = value) || this.m.aa()), value)
}

Stage.prototype.alpha = function(value) {
  if (0 == arguments.length) {
    return this.a.alpha
  }

  value = Number(value)

  if (!isNaN(value)) {
    if (0.1 > value) {
      value = 0.1
    }
    if (1 < value) {
      value = 1
    }
    if (this.a.alpha !== value) {
      this.a.alpha = value
    }
  }
}

Stage.prototype.resize = function(value, input) {
  if (value && input) {
    this.a.width = value
    this.a.height = input
  }

  if (this.a.e) {
    this.a.e.style.width = this.a.width + 'px'
    this.a.e.style.height = this.a.height + 'px'
  }

  if (this.a.h) {
    this.a.h.canvas.setAttribute('width', this.a.width)
    this.a.h.canvas.setAttribute('height', this.a.height)
  }
}

Stage.prototype.setRange = Stage.prototype.Ra = function(s) {
  this.S = s
}

Stage.prototype.ma = function() {
  if (this.a.r) {
    var height = (width = this.a.r())[0]
    var width = width[1]

    if (height && width) {
      if (!(height == this.a.width && width == this.a.height)) {
        this.resize(height, width)
      }
    }
  }
}

Stage.prototype.na = function() {
  if (this.a.s) {
    var chunk = this.a.s()
    if (chunk && !this.paused) {
      this.pause()
    } else {
      if (!chunk && this.paused) {
        this.play()
      }
    }
  }
}

Stage.prototype.addCmt = Stage.prototype.pa = function(item) {
  return (
    item.hasOwnProperty('stime') ||
      (item.stime = this.a.N
        ? new Date().getTime() / 1e3
        : (this.l + new Date().getTime() - this.k) / 1e3),
    this.m.add(item),
    item
  )
}

Stage.prototype.loadCmtFile = Stage.prototype.Ja = function(type, i) {
  var x = new Module()
  var Obj = this

  x.complete = function() {
    var i = 0
    for (; i < x.i.length; i++) {
      if (0 != x.i[i].text.replace(/\r/g, '').length) {
        Obj.m.add(x.i[i])
      }
    }
  }
  x.load(type, i)
}

Stage.prototype.sendCmt = Stage.prototype.Pa = function(
  questionNo,
  type,
  callback,
  last
) {
  !(function(url, data, callback, method) {
    method = method || 'POST'
    var i
    var drilldownLevelLabels = []
    for (i in data) {
      drilldownLevelLabels.push(
        encodeURIComponent(i) + '=' + encodeURIComponent(data[i])
      )
    }
    data = drilldownLevelLabels.join('&')

    var xhr = new XMLHttpRequest()
    xhr.withCredentials = true
    xhr.responseType = 'text'
    xhr.addEventListener('load', function() {
      callback(null, xhr.responseText)
    })
    xhr.addEventListener('error', function() {
      callback('error')
    })
    xhr.addEventListener('abort', function() {
      callback('error')
    })

    if ('GET' == method) {
      url = url + ((-1 == url.indexOf('?') ? '?' : '&') + data)
    }
    xhr.open(method, url, true)
    if ('POST' == method) {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      xhr.send(data)
    } else {
      xhr.send()
    }
  })(questionNo, type, callback, last)
}

Stage.prototype.config = function() {
  return this.a
}

Stage.prototype.connect = function(uri, cb, wait) {}

export default Stage
