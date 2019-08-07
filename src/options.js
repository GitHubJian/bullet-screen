var options = {
  R: 500,
  ia: 60,
  font: '\u9ed1\u4f53',
  duration: 3.5,
  width: 512,
  height: 384,
  alpha: 1,
  n: 1,
  N: false
}

options.setDuration = function(duration) {
  this.duration = duration
}

options.setAlpha = function(alpha) {
  this.alpha = alpha
}

options.setLiveMode = function(i) {
  if ((this.N = i)) {
    this.j = function() {
      return new Date().getTime() / 1e3
    }
  } else {
    this.j = null
  }
}

options.initializeByDiv = function(orig) {
  this.e = orig
  this.u = Node.za
  this.u = Node.ya
  this.F = Node.Ga
  this.v = Node.Aa
  this.h = this.B = null
}

options.attachVideoElement = function(media) {
  this.j = function() {
    return media.currentTime
  }

  this.s = function() {
    return media.paused || media.ended
  }

  this.r = function() {
    return [media.offsetWidth, media.offsetHeight]
  }
}

options.setGetStateFunc = function(r) {
  this.r = r
}

options.setTextScale = function(n) {
  this.n = n
}

options.setMax = function(value) {
  this.R = value
}

options.initializeHandlers = function(cmp, rule, val) {
  this.F = cmp
  this.u = rule
  this.v = val
}

options.setGetTimeFunc = function(b) {
  this.j = b
}

options.setGetSizeFunc = function(rSite) {
  this.r = rSite
}

options.setHeight = function(height) {
  this.height = height
}

options.setWidth = function(width) {
  this.width = width
}

options.setFont = function(value) {
  this.font = value
}

export default options
