import DomUtil from './dom.js'

var isSupportedAgent = function() {
  var userAgent = window.navigator.userAgent

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  )
}

function sliderCtrl(options) {
  if (!options) {
    throw 'Slider: 缺少初始化参数'
  }

  this.options = options
  this.min = options.min || 0
  this.max = options.max || 100
  this.value = -1
  this.label = options.label || ''
  this.upLayer = options.upLayer
  this.parent = options.parent
  this.uiValue = 0
  this.liveDragging = void 0 !== options.liveDragging && options.liveDragging
  this.container = document.createElement('div')
  this.container.className = 'ui-slider-container'
  this.labelLayer = document.createElement('div')
  this.labelLayer.className = 'ui-slider-label'
  this.thumb = document.createElement('div')
  this.thumb.className = 'ui-slider-thumb'
  this.tracker = document.createElement('div')
  this.tracker.className = 'ui-slider-tracker'
  this.eventLayer = document.createElement('div')
  this.eventLayer.className = 'ui-slider-event-layer'
  this.upLayer = this.upLayer || this.eventLayer
  this.container.appendChild(this.tracker)
  this.container.appendChild(this.labelLayer)
  this.container.appendChild(this.thumb)
  this.container.appendChild(this.eventLayer)

  var self = this
  DomUtil.addEvent(this.eventLayer, 'mousedown', function(e) {
    self.onmousedown()
    self.onmousemove(e.pageX, e.pageY)
  })

  DomUtil.addEvent(this.eventLayer, 'touchstart', function(e) {
    me.onmousedown()
    me.ontouchmove(e.touches[0].pageX, e.touches[0].pageY)
  })

  if (!isSupportedAgent()) {
    DomUtil.addEvent(this.upLayer, 'mouseup', function() {
      if (self._down) {
        self.onmouseup()
      }
    })
  }

  this.upLayer.onmouseleave = function(e) {
    if (self._down) {
      console.log('out', e)
      self.onmouseup()
    }
  }

  if (isSupportedAgent()) {
    DomUtil.addEvent(this.upLayer, 'touchend', function() {
      if (self._down) {
        self.onmouseup()
      }
    })
  }

  this.upLayer.onmousemove = function(e) {
    if (self._down) {
      self.onmousemove(e.pageX, e.pageY)
    }
  }

  DomUtil.addEvent(this.eventLayer, 'touchmove', function(e) {
    self.ontouchmove(e.touches[0].pageX, e.touches[0].pageY)
  })

  this.options.parent.appendChild(this.container)
  this.setLabel(this.label)
  this.setValue(this.options.value)
}

sliderCtrl.prototype.constructor = sliderCtrl

sliderCtrl.prototype.onclick = function() {}

sliderCtrl.prototype.onmousedown = function() {
  this._down = true
}

sliderCtrl.prototype.onmouseup = function() {
  if (this._down) {
    this._down = false
    if (this.options.onChange) {
      this.options.onChange(this.uiValue)
      this.setValue(this.uiValue)
    }
  }
}

sliderCtrl.prototype.onmousemove = function(position) {
  if (this._down) {
    position = position - DomUtil.offset(this.container).left
    var newUiValue = this.positionToValue(position)
    var oldUiValue = this.uiValue

    this.uiValue = newUiValue
    this.setValue(newUiValue, false)
    this._updatePosition(true)

    if (
      this.liveDragging &&
      this.options.onChange &&
      this.uiValue != oldUiValue
    ) {
      this.options.onChange(this.uiValue)
    }
  }
}

sliderCtrl.prototype.ontouchmove = function(position) {
  if (this._down) {
    position = position - DomUtil.offset(this.container).left
    var newUiValue = this.positionToValue(position)
    this.uiValue = newUiValue

    this.setValue(newUiValue, false)
    this._updatePosition(true)
  }
}

sliderCtrl.prototype.valueToPosition = function(value) {
  return (value - this.min) / (this.max - this.min)
}

sliderCtrl.prototype.positionToValue = function(position) {
  var size = this.eventLayer.offsetWidth

  position = Math.max(0, position)
  position = Math.min(size, position)

  return this.min + ((this.max - this.min) * position) / size
}

sliderCtrl.prototype.getValue = function() {
  return this.min + this.getPercents() * (this.max - this.min)
}

sliderCtrl.prototype.getPercents = function() {
  return (this.value - this.min) / (this.max - this.min)
}

sliderCtrl.prototype.setValue = function(value) {
  value = Math.min(this.max, Math.max(this.min, value))

  if (this.value != value) {
    this.value = value
    this._dispatchChange(value)
  }
}

sliderCtrl.prototype.setMax = function(value) {
  this.max = value
  this._updatePosition()
}

sliderCtrl.prototype._dispatchChange = function() {
  this._updatePosition()

  if (this.options.labelFunc) {
    this.setLabel(this.label + ': ' + this.options.labelFunc(this.value))
  } else {
    this.setLabel(this.label + ': ' + this.value)
  }
}

sliderCtrl.prototype._updatePosition = function(isUpdatePosition) {
  if (!(this._down && !isUpdatePosition)) {
    this.thumb.style.width = 100 * this.getPercents() + '%'
  }
}

sliderCtrl.prototype.setLabel = function(value) {
  this.labelLayer.innerHTML = value
}

var style = document.createElement('style')
style.type = 'text/css'

style.innerHTML =
  '.ui-slider-container {position: absolute;width: 100%;height: 30px;text-align: center;}.ui-slider-thumb {position: absolute;top: 0px;bottom: 0px;left: 0px;}.ui-slider-thumb:after {content: "";position: absolute;display: block;top: 0px;right: -30px;width: 30px;height: 30px;border-radius: 28px;box-shadow: 0 0 2pt rgba(0, 0, 0, 0.5);background-color: #fff;}.ui-slider-tracker {position: absolute;top: 0px;bottom: 0px;left: 0px;right: -30px;background: #888;}.ui-slider-event-layer {position: absolute;top: 0px;left: 0px;bottom: 0px;right: -30px;}.ui-slider-label {position: absolute;display: block;top: 0px;bottom: 0px;left: 0px;right: 0px;line-height: 30px;font-size: 10px;color: #fff;}'

document.head.appendChild(style)

export default sliderCtrl
