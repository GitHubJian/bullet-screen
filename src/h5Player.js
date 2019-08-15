import EventBus from './event.js'
import Player from './player.js'
import dom from './dom.js'

var _toString = Object.prototype.toString

var template = `<div class="player-container">
<div class="dummy"></div>
<div class="player-box">
  <video width="100%" height="100%" webkit-playsinline playsinline></video>
  <div class="display">
    <div class="input-bar">
      <input
        class="text-input"
        type="text"
        placeholder="请在这里输入弹幕"
      />
      <button class="send-btn">发送</button>
    </div>
    <div class="control-bar hide">
      <span class="control-btn btn-play"
        ><i class="player-icon icon-play"></i
      ></span>
      <span class="control-btn btn-pause hide"
        ><i class="player-icon icon-pause"></i
      ></span>
      <div class="timer-container">
        <span class="control-text time-current-text">00:00</span>
        <span class="control-time-split"></span>
        <span class="control-text time-total-text">24:00</span>
      </div>
      <div class="right">
        <span class="control-btn btn-mute"
          ><i class="player-icon icon-mute"></i
        ></span>
        <span class="control-btn btn-unmute hide"
          ><i class="player-icon icon-unmute"></i
        ></span>
        <span class="control-volume-slider"></span>
        <span class="control-btn btn-comment active"
          ><i class="player-icon icon-comment"></i
        ></span>
        <span class="control-btn btn-repeat"
          ><i class="player-icon icon-repeat"></i
        ></span>
        <span class="control-btn btn-widescreen"
          ><i class="player-icon icon-widescreen"></i
        ></span>
        <span class="control-btn btn-fullscreen active"
          ><i class="player-icon icon-fullscreen"></i
        ></span>
      </div>
      <div class="control-slider"></div>
    </div>
    <div class="comment-layer"></div>
    <div class="load-layer">
      <img />
      <i class="player-icon icon-preview"></i>
    </div>
    <div class="state-icon">
      <i class="buff-icon"></i>
      <i class="pause-icon"></i>
      <i class="play-icon"></i>
    </div>
  </div>
</div>
</div>`

var r = `<div class="player-container">
<div class="dummy"></div>
<div class="player-box">
  <audio></audio>
  <div class="display">
    <div class="audioCover">
      <img class="background" src="" />
      <div class="backgroundCover"></div>
      <div class="cover">
        <img class="coverImg" src="" />
      </div>
    </div>

    <div class="input-bar">
      <input
        class="text-input"
        type="text"
        placeholder="请在这里输入弹幕"
      /><button class="send-btn">发送</button>
    </div>
    <div class="control-bar hide">
      <span class="control-btn btn-play"
        ><i class="player-icon icon-play"></i></span
      ><span class="control-btn btn-pause hide"
        ><i class="player-icon icon-pause"></i
      ></span>
      <div class="time-container">
        <span class="control-text time-current-text">00:00</span>
        <span class="control-time-split"></span>
        <span class="control-text time-total-text">24:00</span>
      </div>
      <div class="right audio">
        <span class="control-btn btn-mute"
          ><i class="player-icon icon-mute"></i></span
        ><span class="control-btn btn-unmute hide"
          ><i class="player-icon icon-unmute"></i></span
        ><span class="control-volume-slider"></span
        ><span class="control-btn btn-comment active hide"
          ><i class="player-icon icon-comment"></i></span
        ><span class="control-btn btn-repeat"
          ><i class="player-icon icon-repeat"></i></span
        ><span class="control-btn btn-widescreen"
          ><i class="player-icon icon-widescreen"></i></span
        ><span class="control-btn btn-fullscreen active"
          ><i class="player-icon icon-fullscreen"></i
        ></span>
      </div>
      <div class="control-slider audio"></div>
    </div>
    <div class="comment-layer"></div>
    <div class="load-layer">
      <img /><i class="player-icon icon-preview"></i>
    </div>
    <div class="state-icon">
      <i class="buff-icon"></i>
      <i class="pause-icon"></i>
      <i class="play-icon"></i>
    </div>
  </div>
</div>
</div>`

var domain = '.bilibili.com'

var H5Player = function() {
  this.options = {
    el: '#bofqi',
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

H5Player.prototype.constructor = H5Player

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
  if (!this.options.el) {
    this.player = {}

    return false
  }

  var i = template
  if ('audio' === this.options.type) {
    i = r
  }

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

  return this
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

    if (this.options.live) {
      this.player = new Player(el, {
        send_cmt_url: data.send_cmt_url,
        get_cmt_url: data.get_cmt_url,
        video_url: data.video_url,
        video_type: null,
        live: true,
        cmt_url: data.comment,
        danmaku_number: data.danmaku_number,
        img: data.image,
        on_state_change: data.on_state_change,
        eventBus: this.eventBus
      })
    } else {
      this.player = new Player(el, {
        aid: data.aid,
        cid: data.cid,
        img: data.image,
        track: data.track,
        video_url: data.video_url,
        cmt_url: data.comment,
        send_cmt_url: data.send_cmt_url,
        get_cmt_url: data.get_cmt_url,
        video_type: 'video/mp4',
        danmaku_number: data.danmaku_number,
        on_state_change: data.on_state_change,
        max_duration: data.max_duration,
        preload: data.preload,
        autoplay: data.autoplay,
        type: data.type,
        eventBus: this.eventBus
      })
    }

    if (this.options.auto_start || this.options.autoplay) {
      this.player.start_video()
    }
  } else {
    if (this.initialized || !(retry_times > 0)) {
      this.player = {}
      return false
    }

    setTimeout(function() {
      retry_times = retry_times - 1
      self.setVideo()

      return false
    }, 500)
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

export default H5Player
