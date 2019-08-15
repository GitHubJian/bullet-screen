function cmtFile() {
  this.i = []
  this.complete = null
  this.ha = 0
}

cmtFile.prototype.constructor = cmtFile

cmtFile.prototype.parse = function(t) {
  if (t) {
    var items = t.getElementsByTagName('data')
    var i = 0
    for (; i < items.length; i++) {
      this.add(items[i])
    }

    items = t.getElementsByTagName('d')
    i = 0
    for (; i < items.length; i++) {
      this.qa(items[i])
    }
  }

  if (this.complete) {
    this.complete()
  }
}

cmtFile.prototype.add = function(type) {
  var id = type.getElementsByTagName('playTime')[0].textContent
  if (!id) {
    id = type.getElementsByTagName('playTime')[0].text
  }
  var content = (button = type.getElementsByTagName('message')[0]).textContent
  if (!content) {
    content = button.text
  }

  var scale = button.getAttribute('color')
  var mode = button.getAttribute('mode')
  var button = button.getAttribute('fontsize')
  var s = type.getElementsByTagName('times')[0].textContent
  if (!s) {
    s = type.getElementsByTagName('times')[0].text
  }

  this.i.push({
    o: parseFloat(id),
    text: String(content).replace(/(\/n|\\n|\n|\r\n)/g, '\r'),
    mode: parseInt(mode),
    size: parseInt(button),
    color: parseInt(scale),
    wa: s
  })
}

cmtFile.prototype.qa = function(b) {
  var p = b.getAttribute('p').split(',')
  var y = b.textContent
  if (!y) {
    y = b.text
  }

  this.i.push({
    stime: parseFloat(p[0]),
    mode: parseInt(p[1]),
    size: parseInt(p[2]),
    color: parseInt(p[3]),
    date: parseInt(p[4]),
    class: parseInt(p[5]),
    uid: p[6],
    dmid: parseInt(p[7]),
    text: String(y).replace(/(\/n|\\n|\n|\r\n)/g, '\r')
  })
}

cmtFile.prototype.load = function(url, convertUrl) {
  var self = this
  !(function(url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.responseType = 'text'
    xhr.addEventListener('load', function() {
      var text
      text = xhr.responseText.replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, '')
      text = new window.DOMParser().parseFromString(text, 'text/xml')

      callback(null, text)
    })

    xhr.addEventListener('error', function() {
      callback('error')
    })

    xhr.addEventListener('abort', function() {
      callback('error')
    })

    xhr.open('GET', url, true)

    xhr.send()
  })(convertUrl ? convertUrl(url) : url, function(error, data) {
    if (error) {
      console.log('reTry')
      if (10 > self.ha) {
        self.ha++

        setTimeout(function() {
          self.load(url, convertUrl)
        }, 1e3)
      }
    } else {
      self.parse(data)
    }
  })
}

export default cmtFile
