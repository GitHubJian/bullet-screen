var doc = document

function $(ownerDocument) {
  return '#' + ('00000' + ownerDocument.toString(16)).slice(-6)
}

function Node(val, s) {
  this.f = val
  this.b = s
  this.height = this.width = 0
  this.canvas = null
  this.bottom = 0
  this.y = 0
  this.x = 0
  this.speed = 0
  this.ea = 0
  this.end = 0
  this.start = 0
  this.index = 16777215

  this.Ha()
}

Node.prototype.constructor = Node

Node.prototype.Ha = function() {
  var params = this.b.F(this.f, this.b)
  this.canvas = params.Z
  this.width = params.width
  this.height = params.height
  this.Fa()
  
  debugger
  if (1 == this.f.mode) {
    this.Ea()
    this.ea = this.start + this.b.width / this.speed
    this.end = this.start + (this.b.width + this.width) / this.speed
  }
}

Node.prototype.Ea = function() {
  this.speed = (512 + this.width) / this.b.duration
}

Node.prototype.Fa = function() {
  this.start = this.f.o
  this.end = this.start + this.b.duration
}

Node.prototype.d = function(data, index) {
  this.y = data
  this.bottom = this.y + this.height
  this.index = index
}

Node.prototype.M = function(v) {
  return this.b.width - (v - this.start) * this.speed
}

Node.prototype.ca = function() {
  if (this.b.v) {
    this.b.v(this.canvas, this.b)
  }
  this.f = this.b = this.canvas = null
}

Node.W = function(opts, d) {
  var elem = doc.createElement('canvas')
  var ctx = elem.getContext('2d')
  var lines = opts.text.split('\r')
  var width = 0
  ctx.font = 'bold ' + opts.size * d.n + 'px ' + d.font
  var height = lines.length * opts.size * d.n * 1.2
  var i = 0

  for (; i < lines.length; i++) {
    var windowWidth = ctx.measureText(lines[i]).width
    if (windowWidth > width) {
      width = windowWidth
    }
  }

  elem.setAttribute('width', width)
  elem.setAttribute('height', height + 2)

  ctx.globalAlpha = d.alpha

  if (opts.border) {
    ctx.strokeStyle = $(opts.borderColor)
    ctx.strokeRect(0, 0, width, height)
  }

  ctx.font = 'bold ' + opts.size * d.n + 'px ' + d.font
  ctx.fillStyle = $(opts.color)
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  ctx.shadowBlur = 4
  ctx.shadowColor = $(Node.X(opts))
  i = 0

  for (; i < lines.length; i++) {
    ctx.fillText(lines[i], 0, (i + 1) * opts.size * d.n)
  }

  return {
    Z: elem,
    width: width,
    height: height
  }
}

Node.va = function(obj, x, y, tile) {
  try {
    if (null != obj.canvas) {
      tile.h.drawImage(obj.canvas, x, y)
    } else {
      console.log(obj, 'Text has not initialized.')
    }
  } catch (deprecationWarning) {}
}

Node.sa = function(chart) {
  chart.h.clearRect(0, 0, chart.width, chart.height)
}

Node.Ga = function(n, d) {
  var container = doc.createElement('div')
  debugger
  container.style.cssText =
    'position: absolute; display: inline-block; white-space: pre; left: ' +
    (d.e.offsetWidth - 1) +
    'px; top: 0px; pointer-events: none; font-weight: bold; ' +
    d.xa
  container.appendChild(doc.createTextNode(n.text.replace(/\r/g, '\r\n')))
  container.style.color = $(n.color)
  container.style.fontSize = n.size * d.n + 'px'
  container.style.fontFamily = d.font
  container.style.opacity = d.alpha
  container.style.textShadow = '1px 1px 1px ' + $(Node.X(n))
  n.border && (container.style.border = 'solid 1px ' + $(n.borderColor))
  d.e.appendChild(container)

  return {
    Z: container,
    width: container.offsetWidth,
    height: container.offsetHeight
  }
}

Node.za = function(overlay, new_left, new_top) {
  overlay.canvas.style.left = new_left + 'px'
  overlay.canvas.style.top = new_top + 'px'
}

Node.ya = function(options, end, height, pos) {
  debugger
  if (!options.Oa) {
    options.Oa = true
    options.canvas.style.left = end + 'px'
    options.canvas.style.top = height + 'px'
    if (4 !== options.f.mode && 5 !== options.f.mode && 1 === options.f.mode) {
      end = function(name) {
        return (
          name +
          'transform: translateX(-' +
          (pos.width + options.width) +
          'px);' +
          name +
          'transition: ' +
          name +
          'transform ' +
          (options.end - options.start) +
          's linear'
        )
      }

      options.canvas.style.cssText += [end('-webkit-'), end('')].join('')
    }
  }
}

Node.Aa = function(sender, row) {
  row.e.removeChild(sender)
}

Node.X = function(b) {
  return b.color ? 0 : 16777215
}

export default Node
