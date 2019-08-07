import EventBus from './event.js'
var _toString = Object.prototype.toString

var domain = '.bilibili.com'

var H5Player = function() {
  this.options = {
    el: '',
    aid: null,
    cid: '',
    page: 1,
    danmaku_number: 150,
    season_type: null,
    qn: 32,
    preload: false,
    send_cmt_url: '//corpcmt.hdslb.net/post',
    get_cmt_url: null,
    live: false,
    track: false,
    on_state_change: null,
    get_from_local: false,
    comment: null,
    image: null,
    video_url: null,
    high_quality: false,
    retry_times: 5,
    max_duration: null
  }

  this.eventBus = new EventBus()
}

H5Player.prototype.constructor = player

H5Player.prototype.on = function(event, listener) {
  this.eventBus.on(event, listener, this)
}

H5Player.prototype.off = function(event, listener) {
  this.eventBus.off(event, listener, this)
}

H5Player.prototype.create = function(options) {
  var self = this
  '[object Object]' == _toString.call(options) &&
    (this.options = Object.assign({}, this.options, options))
  if (!this.options.ele) {
    this.player = {}

    return false
  }

  var i = `<div class="player-container"></div>`

  var fragment = document.createDocumentFragment()
  var div = document.createElement('div')
  div.innerHTML = i
  fragment.appendChild(div)

  var root = this.options.el

  if (!_toString.call(this.options.el).match(/HTML.+Element/)) {
    root = document.querySelector(this.options.el)
  }

  dom.appendTo(fragment.firstChild.childNodes, root)

  if (this.options.get_from_local) {
    this.initialized = true
    setTimeout(this.setVideo())
  } else {
    if (this.options.season_type) {
      if (!this.options.cid) {
        this.initialized = true
        return false
      }

      // fetch

      self.setUgc()
    }
  }
}

H5Player.prototype.setUgc = function() {
  var self = this
  var data = this.options

  var options = {
    avid: data.aid,
    cid: data.cid,
    qn: 0,
    type: 'mp4',
    otype: 'json',
    fnver: 0,
    fnval: 1,
    platform: 'html5'
  }

  if (data.high_quality) {
    options.high_quality = 1
  }
}

H5Player.prototype.cookie = {
  get: function(v) {
    var text = '' + document.cookie
    var offset = text.indexOf(v + '=')

    if (-1 == offset || '' == v) {
      return ''
    }

    var i = text.indexOf(';', offset)

    ;-1 == i && (i = text.length)

    return unescape(text.substring(offset + v.length + 1, i))
  },
  set: function(k, v) {
    var now = new Date()
    now.setTime(now.getTime() + 72e5)
    document.cookie =
      k +
      '=' +
      escape(v) +
      '; expires=' +
      now.toGMTString() +
      '; path=/; domain=' +
      domain
  }
}

H5Player.prototype.setVideo = function() {
  var data = this.options
  var self = this
  if (data.video_url) {
    var el = data.el
    if (!_toString.call(el).match(/HTML.+Element/)) {
      el = document.querySelector(data.el)
    }

    if(this.options.live){
      this.player = new  
      ///  写到这里了
    }
  }
}

H5Player.prototype.getQuery = function() {
  return window.location.href.split('?')[1]
}

H5Player.prototype.sendComment = function(data, number, callback) {
  if (!this.player) {
    return false
  }

  this.player.send_comment(data, number, callback)
}
