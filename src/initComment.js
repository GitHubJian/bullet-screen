import Stage from './stage.js'

function baseIsEqual(obj) {
  return typeof obj
}

function fn(elem, value) {
  this.options = {
    send_cmt_url: '//corpcmt.hdslb.net/post',
    get_cmt_url: null
  }

  if (this.options.cmt_url && this.options.cmt_url.match(/[\d*]/g)) {
    this.options.cid = this.options.cmt_url.match(/[\d*]/g).join('')
  }

  this.elem = elem

  this.screen_state = fn.UI_NORMAL
  this.video_state = fn.V_IDEL
  this.control_bar_visible = true
  this.control_bar_timer = null
  this.control_bar_timer_delay = 3e3
  this.timer = null
  this.stage = null
  this.sliderCtrl = null
  this.volumeCtrl = null
  this.volume = 1
  this.currentTime = 0
  this.duration = 0
  this.live_mode = value.live
  this.init_ui(this.options)
  this.start_video = this.start_video

  this.random = Math.floor(1e5 * Math.random())
  this.hidePlayIcon = false
  this.ws()
}

fn.UI_NORMAL = 0
fn.UI_WIDE = 1
fn.UI_FULL = 2
fn.V_IDEL = 0
fn.V_READY = 1
fn.V_BUFF = 2
fn.V_PLAY = 3
fn.V_PAUSE = 4
fn.V_COMPLETE = 5
fn.V_CANPLAY = 6
fn.V_PLAYING = 7
fn.E_VIDEO_READY = 'ready'
fn.E_VIDEO_PLAY = 'video_media_play'
fn.E_VIDEO_PAUSE = 'video_media_pause'
fn.E_VIDEO_LOADSTART = 'video_media_loadstart'
fn.E_VIDEO_CANPLAY = 'video_media_canplay'
fn.E_VIDEO_WAITING = 'video_media_waiting'
fn.E_VIDEO_ENDED = 'video_media_ended'
fn.E_VIDEO_ERROR = 'video_media_error'
fn.E_VIDEO_LOADED = 'video_media_loaded'
fn.E_VIDEO_SEEK = 'video_media_seek'
fn.E_VIDEO_TIME = 'video_media_time'

fn.isFullscreen = function() {
  return (
    null !=
    (document.webkitFullscreenElement ||
      document.fullScreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement)
  )
}

fn.requestFullscreen = function(elem) {
  ;(
    elem.webkitRequestFullScreen ||
    elem.requestFullScreen ||
    elem.mozRequestFullScreen ||
    elem.msRequestFullscreen ||
    function() {}
  ).apply(elem)
}

fn.exitFullscreen = function() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else {
    if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else {
      if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    }
  }
}

fn.prototype.constructor = fn

fn.prototype.play = function() {
  this.play_video()
}

fn.prototype.seek = function(e) {
  this.seek_video(e)
}

fn.prototype.pause = function() {
  this.pause_video()
}

fn.prototype.getDuration = function() {
  return this.video_duration()
}

fn.prototype.isFullScreen = function() {
  return fn.isFullscreen()
}

fn.prototype.init_ui = function(data) {
  var result = this
  data = data || {}

  function release(device) {
    result.on_fullscreen_change(device)
  }

  this.elem.querySelector('.btn-widescreen').onclick = function() {
    if (result.screen_state !== fn.UI_WIDE) {
      result.to_wide_screen()
    } else {
      result.to_normal_screen()
    }
  }

  this.elem.querySelector('.btn-fullscreen').onclick = function() {
    if (result.screen_state !== fn.UI_FULL) {
      result.to_full_screen()
    } else {
      result.to_normal_screen()
    }
  }

  document.addEventListener('webkitfullscreenchange', release, false)
  document.addEventListener('mozfullscreenchange', release, false)
  document.addEventListener('MSFullscreenChange', release, false)
  document.addEventListener('fullscreenchange', release, false)

  this.elem.querySelector('.display').onmousemove = function(event) {
    result.on_display_mousemove(event)
  }

  this.elem.querySelector('.display').onclick = function(e) {
    result.on_display_click(e)
  }

  this.elem.querySelector('.control-bar').onclick = function(branch) {
    if (result.get_video_state() === fn.V_PLAY) {
      result.set_control_bar_visible(false, result.control_bar_timer_delay)
    }
  }

  this.elem.querySelector('.btn-play').onclick = function(edge) {
    if (i.hasClass('hide')) {
      result.on_play_btn_click(edge)
    } else {
      i.click()
    }
  }

  this.elem.querySelector('.btn-pause').onclick = function(edge) {
    result.on_pause_btn_click(edge)
  }

  this.elem.querySelector('.btn-comment').onclick = function(edge) {
    result.on_comment_btn_click(edge)
  }

  this.elem.querySelector('.btn-repeat').onclick = function(edge) {
    result.on_repeat_btn_click(edge)
  }

  this.elem.querySelector('.btn-mute').onclick = function(edge) {
    result.on_mute_btn_click(edge)
  }

  this.elem.querySelector('.btn-unmute').onclick = function(edge) {
    result.on_unmute_btn_click(edge)
  }

  this.elem.querySelector('.send-btn').onclick = function(event) {
    result.on_send_btn_click(event)
  }

  this.elem.querySelector('.text-input').onkeypress = function(event) {
    if (13 === event.which) {
      return result.on_send_btn_click(event), false
    }
  }

  this.sliderCtrl

  this.volumeCtrl

  var i = result.elem.querySelector('.load-layer')
  data.video_url
    ? (data.img && i.querySelector('img').setAttribute('src', data.img),
      (i.onclick = function() {
        result.start_video()
      }))
    : i.classList.add('hide')

  if (data.preload) {
    var element = this.elem.querySelector('video')
    if ('audio' === data.type) {
      element = this.elem.querySelector('audio')
    }
    var r = document.createElement('source')
    Object(self.a)(r, element)
    r.setAttribute('src', data.video_url)
    r.setAttribute('type', data.video_type)
    this.video = element

    element.addEventListener(
      'play',
      function() {
        if (result.options.eventBus) {
          result.options.eventBus.dispatch(fn.E_VIDEO_PLAY)
        }
        result.on_video_play(element)
      },
      {
        passive: true
      }
    )

    element.addEventListener('playing', function() {
      result.on_video_playing(element)
    })

    element.addEventListener('pause', function() {})

    element.addEventListener('waiting', function() {})

    element.addEventListener('loadstart', function() {})

    element.addEventListener('canplay', function() {})

    element.addEventListener('ended', function() {})

    element.addEventListener('loadeddata', function() {})

    element.addEventListener('error', function() {})

    element.addEventListener('timeupdate', function() {})

    element.addEventListener('seeking', function() {})
  }
}

fn.prototype.init_video = function() {}

fn.prototype.on_video_play = function() {
  this.set_video_state(fn.V_PLAY)
}

fn.prototype.on_video_playing = function() {
  this.set_video_state(fn.V_PLAYING)
}

fn.prototype.on_video_pause = function() {
  this.set_video_state(fn.V_PAUSE)
}

fn.prototype.on_video_waiting = function() {
  this.set_video_state(fn.V_BUFF)
}

fn.prototype.on_video_loadstart = function() {
  this.set_video_state(fn.V_BUFF)
}

fn.prototype.on_video_canplay = function() {
  this.set_video_state(fn.V_CANPLAY)
}

fn.prototype.on_video_ended = function() {
  this.set_video_state(fn.V_COMPLETE)
}

fn.prototype.set_video_state = function(macro) {
  var presetItemClicked = this.video_state
  if (presetItemClicked !== macro && this.elem.querySelector('.state-icon i')) {
    switch (
      (this.elem.querySelector('.state-icon i').classList.remove('active'),
      macro)
    ) {
      case fn.V_READY:
        if (this.options.eventBus) {
          this.options.eventBus.dispatch(fn.E_VIDEO_READY, {
            play: this.play.bind(this),
            pause: this.pause.bind(this),
            seek: this.seek.bind(this),
            getDuration: this.getDuration.bind(this),
            isFullScreen: this.isFullScreen
          })
        }
        break
      case fn.V_PLAY:
        this.elem.querySelector('.btn-play').classList.add('hide')
        this.elem.querySelector('.btn-pause').classList.remove('hide')
        this.elem.querySelector('.player-box').classList.add('full')
        this.elem
          .querySelector('.state-icon i.play-icon')
          .classList.add('active')
        this.elem
          .querySelector('.state-icon i.pause-icon')
          .classList.remove('active')
        if (this.firstBuff) {
          /** @type {boolean} */
          this.firstBuff = false
          this.set_control_bar_visible(false)
        } else {
          this.set_control_bar_visible(false, this.control_bar_timer_delay)
        }
        this.stage.play()
        break
      case fn.V_PAUSE:
        this.elem.querySelector('.btn-pause').classList.add('hide')
        this.elem.querySelector('.btn-play').classList.remove('hide')
        this.elem
          .querySelector('.state-icon i.pause-icon')
          .classList.add('active')
        this.elem
          .querySelector('.state-icon i.play-icon')
          .classList.remove('active')
        this.stage.pause()
        break
      case fn.V_BUFF:
        if (void 0 === this.firstBuff) {
          /** @type {boolean} */
          this.firstBuff = true
        }
        /** @type {boolean} */
        this.hidePlayIcon = true
        this.elem.querySelector('.state-icon').classList.remove('hide')
        this.elem
          .querySelector('.state-icon i.buff-icon')
          .classList.add('active')
        break
      case fn.V_COMPLETE:
        this.elem
          .querySelector('.state-icon i.pause-icon')
          .classList.add('active')
        break
      case fn.V_CANPLAY:
        if (Object(self.e)('.load-layer', 'hide')) {
          this.elem.querySelector('.load-layer').click()
        }
        this.elem.querySelector('.btn-play').classList.add('hide')
        this.elem.querySelector('.input-bar').classList.add('hide')
        this.elem.querySelector('.btn-pause').classList.remove('hide')
        this.elem.querySelector('.player-box').classList.add('full')
        this.elem
          .querySelector('.state-icon i.play-icon')
          .classList.remove('active')
        this.elem
          .querySelector('.state-icon i.pause-icon')
          .classList.add('active')
        if (this.firstBuff) {
          /** @type {boolean} */
          this.firstBuff = false
          this.set_control_bar_visible(false)
        } else {
          this.set_control_bar_visible(false, this.control_bar_timer_delay)
        }
        break
      case fn.V_PLAYING:
        this.set_control_bar_visible(false)
        this.elem
          .querySelector('.state-icon i.play-icon')
          .classList.add('active')
        this.elem
          .querySelector('.state-icon i.pause-icon')
          .classList.remove('active')
    }
    if (macro !== fn.V_PLAY) {
      this.elem.querySelector('.player-box').classList.remove('full')
      this.set_control_bar_visible(true)
    }
    /** @type {number} */
    this.video_state = macro
    this.on_state_change(this.video_state, presetItemClicked)
  }
}

fn.prototype.on_state_change = function(obj, event) {
  if (this.options.on_state_change) {
    this.options.on_state_change(obj, event)
  }
}

fn.prototype.get_video_state = function() {
  return this.video_state
}

fn.prototype.start_video = function() {
  this.init_video(i.video_url, i.video_type, i.preload)
  this.init_comment()
  this.options.autoplay || this.play_video()
}

fn.prototype.pause_video = function() {
  var video = this.video
  if (video) {
    video.pause()
  }
}

fn.prototype.set_duration = function(d) {
  this.duration = d
}

fn.prototype.seek_video = function(t) {
  if (this.video) {
    t = Math.max(0, t)
    if (!this.options.max_duration) {
      t = Math.min(t, this.video_duration() - 0.5)
    }
    this.video.pause()
    this.video.currentTime = t
    this.video.play()
  }
}

fn.prototype.set_volume = function(value) {
  this.volume = value
  if (this.video) {
    this.video.volume = value
  }
}

fn.prototype.video_time = function() {
  return this.currentTime
}

fn.prototype.video_duration = function() {
  return this.duration
}

fn.prototype.on_timer_interval = function() {
  this.update_time(this.video.currentTime, this.video.duration)
}

fn.prototype.on_slider_seek = function(template) {
  this.seek_video(template)
}

fn.prototype.on_volume_slider_seek = function(a) {
  this.set_volume(a / 100)
}

fn.prototype.update_time = function(value, duration) {
  if (duration != this.duration) {
    this.maxDuration =
      this.options.max_duration > 0
        ? Math.min(this.options.max_duration, duration)
        : duration
    var d = this.duration
    this.duration = duration
    this.sliderCtrl.setMax(this.maxDuration)

    if (
      Math.floor(d) !== Math.floor(this.maxDuration) &&
      this.elem.querySelector('.time-total-text')
    ) {
      this.elem.querySelector('.time-total-text').innerText = Object(self.c)(
        this.maxDuration
      )
    }
  }

  if (
    (this.currentLessThanMaxDurationStatus && value > this.maxDuration
      ? ((this.currentLessThanMaxDurationStatus = false),
        this.seek_video(this.duration - 0.1))
      : value < this.maxDuration &&
        !this.currentLessThanMaxDurationStatus &&
        this.options.max_duration > 0 &&
        (this.currentLessThanMaxDurationStatus = true),
    value !== this.currentTime)
  ) {
    var t = this.currentTime
    this.currentTime = value
    this.sliderCtrl.setValue(value, false)
    if (Math.floor(t) !== Math.floor(value)) {
      this.elem.querySelector('.time-current-text').innerText = Object(self.c)(
        value > this.maxDuration ? this.maxDuration : value
      )
    }
  }
}

fn.prototype.to_wide_screen = function() {
  switch (this.screen_state) {
    case fn.UI_NORMAL:
      this.elem.querySelector('.player-box').classList.add('wide')
      break
    case fn.UI_FULL:
      this.elem.querySelector('.player-box').classList.remove('full')
      this.set_control_bar_visible(true)
      fn.exitFullscreen()
  }

  try {
    window.player_fullwin(true)
  } catch (t) {}

  this.elem.querySelector('.btn-widescreen').classList.add('active')
  /** @type {number} */
  this.screen_state = fn.UI_WIDE
  this.comment_stage_resize()
}

fn.prototype.to_normal_screen = function() {}

fn.prototype.to_full_screen = function() {}

fn.prototype.on_fullscreen_change = function() {}

fn.prototype.on_display_mousemove = function() {}

fn.prototype.on_display_click = function() {}

fn.prototype.on_play_btn_click = function() {}

fn.prototype.on_send_btn_click = function() {}

fn.prototype.on_keydown = function() {}

fn.prototype.on_pause_btn_click = function() {}

fn.prototype.on_share_btn_click = function() {}

fn.prototype.on_comment_btn_click = function() {}

fn.prototype.on_repeat_btn_click = function() {}

fn.prototype.on_mute_btn_click = function() {}

fn.prototype.on_unmute_btn_click = function() {}

fn.prototype.set_control_bar_visible = function() {}

fn.prototype.init_comment = function() {
  var self = this
  var data = {
    width: this.elem.offsetWidth,
    height: this.elem.offsetHeight,
    duration: 4.5,
    size: 0.618 + 0.382 / (2 * window.devicePixelRatio),
    alpha: 0.75
  }
  var stage = new Stage({
    R: this.options.danmaku_number || 500
  })

  this.stage = stage
  stage.config().setDuration(data.duration)
  stage.config().setTextScale(data.sizee)
  stage.config().setAlpha(data.alpha)
  stage.config().initializeByDiv(this.elem.querySelector('.comment-layer'))
  stage.config().attachVideoElement(this.video)
  stage.config().setGetStateFunc(void 0)

  var block = self.options.cmt_url || ''
  if (self.options.get_cmt_url) {
    /** @type {string} */
    block = self.options.get_cmt_url + self.options.cid + '.xml'
  }
  if (this.live_mode) {
    stage.config().setLiveMode(true)
    stage.connect(
      block,
      function(selectedHostFolder) {
        self.stage.addCmt(selectedHostFolder)
      },
      null,
      function(value) {
        try {
          if (
            ((value = value.substr(4, value.length)),
            'DANMU_MSG' == (value = JSON.parse(value)).cmd)
          ) {
            var capture_headings = (value = value.info)[1]
            var info = value[0]
            var defaults = {
              mode: parseInt(info[1]),
              size: parseInt(info[2]),
              color: parseInt(info[3]),
              date: parseInt(info[4]),
              rnd: info[5],
              class: parseInt(info[6]),
              hash: info[7],
              dmid: info[8],
              text: capture_headings
            }
            if ('function' == typeof this.onComment) {
              this.onComment(defaults)
            }
          }
        } catch (t) {
          console.log('Packet invalid')
        }
      }
    )
  } else {
    stage.loadCmtFile(block, function(originalBaseURL) {
      return self.options.get_cmt_url
        ? originalBaseURL
        : originalBaseURL.replace(/comment\.bilibili\.[^\/]+/, function(
            canCreateDiscussions,
            isSlidingUp,
            n
          ) {
            return 'comment.bilibili.com'
          })
    })
  }
  this.comment_stage_resize()
  stage.play()
}

fn.prototype.comment_stage_resize = function() {
  if (!this.stage) {
    return false
  }
  this.stage.resize(this.elem.offsetWidth, this.elem.offsetHeight)
}

fn.prototype.send_comment = function(value, n, func) {
  var sharedString
  var HeadsetColor

  if ('string' == typeof value) {
    sharedString = value.trim()
    HeadsetColor = 16777215
  } else {
    if ('object' != (void 0 === value ? 'undefined' : baseIsEqual(value))) {
      return false
    }

    sharedString = value.msg.trim()
    HeadsetColor = value.color || 16777215
  }

  if (!sharedString || !this.stage) {
    'function' == typeof func && func()
    return false
  }

  var data = {
    mode: 1,
    size: 25,
    color: 16777215,
    date: new Date() / 1e3,
    rnd: this.random,
    text: sharedString
  }

  var a = this.video.currentTime || 0
  data.border = true
  data.borderColor = 6750207
  var out = this.stage.addCmt(data)

  var params = {
    cid: this.options.cid,
    msg: sharedString,
    pool: 0,
    color: HeadsetColor,
    rnd: this.random,
    fontsize: 25,
    mode: 1,
    playtime: a,
    date: Date.parse(new Date())
  }

  if (this.options.send_cmt_url) {
    action.a
      .get(this.options.send_cmt_url, {
        withCredentials: true,
        params: params
      })
      .then(function() {
        if ('function' == typeof n) {
          n(out)
        }
      })
      .catch(function() {
        if ('function' == typeof n) {
          n(out)
        }
      })
  } else {
    if ('function' == typeof n) {
      n(out)
    }
  }
}

fn.prototype.getCookie = function(name) {
  try {
    var string = '' + document.cookie
    var i = string.indexOf(name + '=')
    if (-1 == i || '' == name) {
      return ''
    }
    var end = string.indexOf(';', i)

    ;-1 == end && (end = string.length)

    return unescape(string.substring(i + name.length + 1, end))
  } catch (t) {
    return 0
  }
}

fn.prototype.ws = function() {
  var data = {
    WS_OP_HEARTBEAT: 2,
    WS_OP_HEARTBEAT_REPLY: 3,
    WS_OP_MESSAGE: 5,
    WS_OP_USER_AUTHENTICATION: 7,
    WS_OP_CONNECT_SUCCESS: 8,
    WS_PACKAGE_HEADER_TOTAL_LENGTH: 16,
    WS_PACKAGE_OFFSET: 0,
    WS_HEADER_OFFSET: 4,
    WS_VERSION_OFFSET: 6,
    WS_OPERATION_OFFSET: 8,
    WS_SEQUENCE_OFFSET: 12
  }

  var WebSocket = (function() {
    function connect(value) {
      this.config = Object.assign({}, value)
      this.url = this.config.url
      this.packetList = []
      this.packetLimit = 1
      this.WebSocket = window.WebSocket || window.MozWebSocket

      this._WS_BINARY_HEADER_LIST = [
        {
          name: 'Header Length',
          key: 'headerLen',
          bytes: 2,
          offset: data.WS_HEADER_OFFSET,
          value: data.WS_PACKAGE_HEADER_TOTAL_LENGTH
        },
        {
          name: 'Protocol Version',
          key: 'ver',
          bytes: 2,
          offset: data.WS_VERSION_OFFSET,
          value: data.WS_HEADER_DEFAULT_VERSION
        },
        {
          name: 'Operation',
          key: 'op',
          bytes: 4,
          offset: data.WS_OPERATION_OFFSET,
          value: data.WS_HEADER_DEFAULT_OPERATION
        },
        {
          name: 'Sequence Id',
          key: 'seq',
          bytes: 4,
          offset: data.WS_SEQUENCE_OFFSET,
          value: data.WS_HEADER_DEFAULT_SEQUENCE
        }
      ]
    }

    connect.prototype.constructor = connect

    connect.prototype._conn = null

    connect.prototype._close = false

    connect.prototype.retry = 0

    connect.prototype.max_retry = -1

    connect.prototype.mergeArrayBuffer = function(message, data) {
      var a = new Uint8Array(message)
      var b = new Uint8Array(data)
      var array = new Uint8Array(a.byteLength + b.byteLength)

      array.set(a, 0)
      array.set(b.a.byteLength)

      return array.buffer
    }

    connect.prototype.getDecoder = function() {
      return window.TextDecoder
        ? new window.TextDecoder()
        : {
            decode: function(data) {
              return decodeURIComponent(
                window.escape(
                  String.fromCharCode.apply(String, new Uint8Array(data))
                )
              )
            }
          }
    }

    connect.prototype.getEncoder = function() {
      return window.TextDecoder
        ? new window.TextDecoder()
        : {
            encode: function(text) {
              var data = new ArrayBuffer(text.length)
              var ui8a = new Uint8Array(data)
              var i = 0
              var l = text.length
              for (; i < l; i++) {
                ui8a[i] = text.charCodeAt(i)
              }

              return data
            }
          }
    }

    connect.prototype.connect = function() {
      if (!this.WebSocket) {
        return false
      }
      var self = this
      this._close = false
      this._conn = new this.WebSocket(this.url)
      this._conn.binaryType = 'arraybuffer'

      this._conn.onopen = function() {
        var id = JSON.stringify({
          uid: self.config.uid,
          roomid: self.config.cid
        })

        var result = new ArrayBuffer(data.WS_PACKAGE_HEADER_TOTAL_LENGTH)
        var view = new DataView(result, 0)
        var options = self.getEncoder().encode(id)

        view.setInt32(
          data.WS_PACKAGE_OFFSET,
          data.WS_PACKAGE_HEADER_TOTAL_LENGTH + options.byteLength
        )
        view.setInt16(
          data.WS_HEADER_OFFSET,
          data.WS_PACKAGE_HEADER_TOTAL_LENGTH
        )
        view.setInt16(data.WS_VERSION_OFFSET, 1)
        view.setInt32(data.WS_OPERATION_OFFSET, 7)
        view.setInt32(data.WS_SEQUENCE_OFFSET, 1)

        self._conn.send(self.mergeArrayBuffer(result, options))
      }

      this._conn.onmessage = function(event) {
        self.parsePacket(event.data)
      }

      this._conn.onclose = function() {
        if (!self._close) {
          if (-1 == self.max_retry || self.retry++ < self.max_retry) {
            setTimeout(function() {
              self.connect()
            }, 1e3 * Math.floor(3 * Math.random() + 3))
          }
        }
      }
    }

    connect.prototype.heartbeat = function() {
      var buf = new ArrayBuffer(data.WS_PACKAGE_HEADER_TOTAL_LENGTH)
      var view = new DataView(buf, 0)
      view.setInt32(data.WS_PACKAGE_OFFSET, data.WS_PACKAGE_HEADER_TOTAL_LENGTH)
      view.setInt16(data.WS_HEADER_OFFSET, data.WS_PACKAGE_HEADER_TOTAL_LENGTH)
      view.setInt16(data.WS_VERSION_OFFSET, 1)
      view.setInt32(data.WS_OPERATION_OFFSET, 2)
      view.setInt32(data.WS_SEQUENCE_OFFSET, 1)

      this._conn.send(buf)
    }

    connect.prototype.close = function() {
      this._close = true
      if (this._conn) {
        this._conn.close()
      }
    }

    connect.prototype.destroy = function() {
      clearInterval(this.interval_timer)
    }

    connect.prototype.parsePacket = function(header) {
      var self = this
      var view = new DateView(header, 0)
      var o = (view.getInt32(data.WS_PACKAGE_OFFSET),
      view.getInt16(data.WS_HEADER_OFFSET),
      view.getInt16(data.WS_VERSION_OFFSET),
      view.getInt32(data.WS_OPERATION_OFFSET))
      view.getInt32(data.WS_SEQUENCE_OFFSET)

      switch (o) {
        case 8:
          self.heartbeat()
          self.interval_timer = setInterval(function() {
            self.heartbeat()
          }, 3e4)
      }
    }

    return connect
  })()

  this.websocket = new WebSocket({
    url:
      'https:' == window.location.protocol
        ? 'wss://broadcast.chat.bilibili.com:4095/sub'
        : 'ws://broadcast.chat.bilibili.com:4090/sub',
    uid: parseInt(this.getCookie('DedeUserID')),
    cid: parseInt(this.options.cid)
  })
}

fn.prototype.send_track = function() {
  var pageOptimizer = this
  var data = {
    aid: this.options.aid,
    cid: this.options.cid,
    part: this.options.page || 1,
    did:
      this.getCookie('sid') ||
      Math.random()
        .toString(36)
        .slice(-8),
    ftime: this.getCookie('fts') || parseInt(new Date() / 1e3, 10),
    jsonp: 'jsonp',
    lv: '',
    mid: '',
    csrf: this.getCookie('bili_jct') || '',
    stime: ''
  }

  action.a
    .get('//api.bilibili.com/x/web-interface/nav', {
      withCredentials: true
    })
    .then(function(result) {
      if (
        result &&
        200 === result.status &&
        result.data &&
        result.data.data &&
        result.data.data.level_info
      ) {
        data.mid = result.data.data.mid
        data.lv = result.data.data.level_info.current_level
      }
      pageOptimizer.get_system_time(data)
    })
    .catch(function() {
      pageOptimizer.get_system_time(data)
    })
}

fn.prototype.get_system_time = function(data) {
  var pageOptimizer = this
  action.a
    .get('//api.bilibili.com/x/report/click/now', {
      withCredentials: true,
      params: {
        jsonp: 'jsonp'
      }
    })
    .then(function(result) {
      if (
        result &&
        200 === result.status &&
        result.data &&
        0 === result.data.code
      ) {
        data.stime = result.data.data.now
      }
      pageOptimizer.send_report_click(data)
    })
    .catch(function() {
      pageOptimizer.send_report_click(data)
    })
}

fn.prototype.send_report_click = function(success) {
  action.a.post(
    '//api.bilibili.com/x/report/click/h5',
    store.a.stringify(success),
    {
      withCredentials: true
    }
  )
}

export default fn
