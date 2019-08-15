const formatTime = function(v) {
  if (void 0 === v) v = 0
  var ret

  v = Math.floor(v) >> 0
  ret = ('0' + (v % 60)).slice(-2)

  if ((ret = Math.floor(v / 60) + ':' + ret).length < 5) {
    ret = '0' + ret
  }

  return ret
}

const appendTo = function(node, parentNode) {
  var fragment = document.createDocumentFragment()

  if ('[object NodeList]' === Object.prototype.toString.call(node)) {
    var i = 0
    for (; i < node.length; i++) {
      fragment.appendChild(node[i])
    }
  } else {
    fragment.appendChild(node)
  }

  parentNode.appendChild(fragment)
  return parentNode
}

const hasClass = function(node, className) {
  return (' ' + node.className + ' ').indexOf(' ' + className + '  ') > -1
}

const addEvent = function(el, event, fn) {
  if (el.addEventListener) {
    return void el.addEventListener(event, fn, false)
  }

  var n = 'on' + event
  if (el.attachEvent) {
    return void el.attachEvent(n, fn)
  }

  var v = el[n]
  el[n] = function(e) {
    e = e || window.event
    fn.call(null, e)

    if (v) {
      v.call(null, e)
    }
  }
}

const offset = function(item) {
  var x = 0
  var y = 0

  for (; item; ) {
    y = item.offsetTop
    x = x + item.offsetLeft
    item = item.offsetParent
  }

  return {
    left: x,
    top: y
  }
}

export const b = function(node) {
  if (!node.hasOwnProperty('offsetX')) {
    var x = 0
    var y = 0

    if (node.offsetParent) {
      var p = node
      do {
        x = x + p.offsetLeft
        y = y + p.offsetTop
      } while ((p = p.offsetParent))
    }

    node.offsetX = node.layerX - x
    node.offsetY = node.layerY - y
  }

  return node
}

export default {
  formatTime,
  appendTo,
  addEvent,
  offset,
  hasClass
}
