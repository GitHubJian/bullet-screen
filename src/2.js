var _toString = Object.prototype.toString
var _hasOwn = Object.prototype.hasOwnProperty

function isArray(v) {
  return '[object Array]' === _toString.call(v)
}

function isObject(v) {
  return null !== v && 'object' == typeof v
}

function isFunction(v) {
  return '[object Function]' === _toString.call(v)
}

function forEach(v, callback) {
  if (null !== v && void 0 !== v) {
    'object' != typeof v && (v = [v])
    if (isArray(v)) {
      var i = 0
      var len = v.length

      for (; i < len; i++) {
        callback.call(null, v[i], i, v)
      }
    } else {
      var name
      for (name in v) {
        if (_hasOwn.call(v, name)) {
          callback.call(null, v[name], name, v)
        }
      }
    }
  }
}

function isArrayBuffer(v) {
  return '[object ArrayBuffer]' === _toString.call(v)
}

function isBuffer(o) {
  function _isBuffer(v) {
    return (
      !!v.constructor &&
      'function' == typeof v.constructor.isBuffer &&
      v.constructor.isBuffer(v)
    )
  }

  return (
    null != o &&
    (_isBuffer(o) ||
      (function(o) {
        return (
          'function' == typeof o.readFloatLE &&
          'function' == typeof o.slice &&
          _isBuffer(o.slice(0, 0))
        )
      })(o) ||
      !!o._isBuffer)
  )
}

function isFormData(v) {
  return 'undefined' != typeof FormData && v instanceof FormData
}

function isArrayBufferView(v) {
  return 'undefined' != typeof ArrayBuffer && ArrayBuffer.isView
    ? ArrayBuffer.isView(v)
    : v && v.buffer && v.buffer instanceof ArrayBuffer
}

function isString(v) {
  return 'string' == typeof v
}

function isNumber(v) {
  return 'number' == typeof v
}

function isUndefined(v) {
  return void 0 === v
}

function isDate(v) {
  return '[object Date]' === _toString.call(v)
}

function isFile(v) {
  return '[object File]' === _toString.call(v)
}

function isBlob(v) {
  return '[object Blob]' === _toString.call(v)
}

function isStream(v) {
  return isObject(v) && isFunction(v.pipe)
}

function isURLSearchParams(v) {
  return 'undefined' != typeof URLSearchParams && v instanceof URLSearchParams
}

function isStandardBrowserEnv() {
  return (
    ('undefined' == typeof navigator || 'ReactNative' !== navigator.product) &&
    'undefined' != typeof window &&
    'undefined' != typeof document
  )
}

function merge() {
  function put(v, i) {
    if ('object' == typeof a[i] && 'object' == typeof v) {
      a[i] = merge(a[i], v)
    } else {
      a[i] = v
    }
  }

  var a = {}
  var i = 0
  var l = arguments.length

  for (; i < l; i++) {
    forEach(arguments[i], put)
  }

  return a
}

function _next(type, v) {
  return function() {
    var m = new Array(arguments.length)
    var i = 0
    for (; i < m.length; i++) {
      m[i] = arguments[i]
    }

    return type.apply(v, m)
  }
}

function extend(target, source, options) {
  forEach(source, function(v, k) {
    target[k] = options && 'function' == typeof v ? _next(v, options) : v
  })

  return target
}

function trim(n) {
  return n.replace(/^\s*/, '').replace(/\s*$/, '')
}
