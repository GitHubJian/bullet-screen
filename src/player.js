import Stage from './stage.js'
import dom from './dom.js'
import sliderCtrl from './sliderCtrl.js'

var type =
  'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
    ? function(v) {
        return typeof v
      }
    : function(o) {
        return o &&
          'function' == typeof Symbol &&
          o.constructor === Symbol &&
          o !== Symbol.prototype
          ? 'symbol'
          : typeof o
      }

function player(elem, options) {
  this.options = {
    send_cmt_url: '//corpcmt.hdslb.net/post',
    get_cmt_url: null
  }

  if ('object' === (void 0 === options ? 'undefined' : type(options))) {
    this.options = Object.assign({}, this.options, options)
  }

  if (this.options.cmt_url && this.options.cmt_url.match(/[\d*]/g)) {
    this.options.cid = this.options.cmt_url.match(/[\d*]/g).join('')
  }

  this.elem = elem

  this.screen_state = player.UI_NORMAL
  this.video_state = player.V_IDEL
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
  this.live_mode = options.live

  this.init_ui(this.options)

  this.random = Math.floor(1e5 * Math.random())
  this.hidePlayIcon = false

  this.ws()
}

player.UI_NORMAL = 0
player.UI_WIDE = 1
player.UI_FULL = 2
player.V_IDEL = 0
player.V_READY = 1
player.V_BUFF = 2
player.V_PLAY = 3
player.V_PAUSE = 4
player.V_COMPLETE = 5
player.V_CANPLAY = 6
player.V_PLAYING = 7
player.E_VIDEO_READY = 'ready'
player.E_VIDEO_PLAY = 'video_media_play'
player.E_VIDEO_PAUSE = 'video_media_pause'
player.E_VIDEO_LOADSTART = 'video_media_loadstart'
player.E_VIDEO_CANPLAY = 'video_media_canplay'
player.E_VIDEO_WAITING = 'video_media_waiting'
player.E_VIDEO_ENDED = 'video_media_ended'
player.E_VIDEO_ERROR = 'video_media_error'
player.E_VIDEO_LOADED = 'video_media_loaded'
player.E_VIDEO_SEEK = 'video_media_seek'
player.E_VIDEO_TIME = 'video_media_time'

player.isFullscreen = function() {
  return (
    null !=
    (document.webkitFullscreenElement ||
      document.fullScreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement)
  )
}

player.requestFullscreen = function(elem) {
  ;(
    elem.webkitRequestFullScreen ||
    elem.requestFullScreen ||
    elem.mozRequestFullScreen ||
    elem.msRequestFullscreen ||
    function() {}
  ).apply(elem)
}

player.exitFullscreen = function() {
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

player.prototype.constructor = player

player.prototype.play = function() {
  this.play_video()
}

player.prototype.seek = function(e) {
  this.seek_video(e)
}

player.prototype.pause = function() {
  this.pause_video()
}

player.prototype.getDuration = function() {
  return this.video_duration()
}

player.prototype.isFullScreen = function() {
  return player.isFullscreen()
}

player.prototype.init_ui = function(data) {
  var self = this
  data = data || {}

  function release(device) {
    self.on_fullscreen_change(device)
  }

  this.elem.querySelector('.btn-widescreen').onclick = function() {
    if (self.screen_state !== player.UI_WIDE) {
      self.to_wide_screen()
    } else {
      self.to_normal_screen()
    }
  }

  this.elem.querySelector('.btn-fullscreen').onclick = function() {
    if (self.screen_state !== player.UI_FULL) {
      self.to_full_screen()
    } else {
      self.to_normal_screen()
    }
  }

  document.addEventListener('webkitfullscreenchange', release, false)
  document.addEventListener('mozfullscreenchange', release, false)
  document.addEventListener('MSFullscreenChange', release, false)
  document.addEventListener('fullscreenchange', release, false)

  this.elem.querySelector('.display').onmousemove = function(event) {
    self.on_display_mousemove(event)
  }

  this.elem.querySelector('.display').onclick = function(e) {
    self.on_display_click(e)
  }

  this.elem.querySelector('.control-bar').onclick = function(branch) {
    if (self.get_video_state() === player.V_PLAY) {
      self.set_control_bar_visible(false, self.control_bar_timer_delay)
    }
  }

  this.elem.querySelector('.btn-play').onclick = function(edge) {
    if (i.hasClass('hide')) {
      self.on_play_btn_click(edge)
    } else {
      i.click()
    }
  }

  this.elem.querySelector('.btn-pause').onclick = function(edge) {
    self.on_pause_btn_click(edge)
  }

  this.elem.querySelector('.btn-comment').onclick = function(edge) {
    self.on_comment_btn_click(edge)
  }

  this.elem.querySelector('.btn-repeat').onclick = function(edge) {
    self.on_repeat_btn_click(edge)
  }

  this.elem.querySelector('.btn-mute').onclick = function(edge) {
    self.on_mute_btn_click(edge)
  }

  this.elem.querySelector('.btn-unmute').onclick = function(edge) {
    self.on_unmute_btn_click(edge)
  }

  this.elem.querySelector('.send-btn').onclick = function(event) {
    self.on_send_btn_click(event)
  }

  this.elem.querySelector('.text-input').onkeypress = function(event) {
    if (13 === event.which) {
      return self.on_send_btn_click(event), false
    }
  }

  this.sliderCtrl = new sliderCtrl({
    parent: this.elem.querySelector('.control-slider'),
    upLayer: this.elem.querySelector('.display'),
    onChange: function(v) {
      self.on_slider_seek(v)
    }
  })

  this.volumeCtrl = new sliderCtrl({
    parent: this.elem.querySelector('.control-volume-slider'),
    upLayer: this.elem.querySelector('.control-volume-slider'),
    liveDragging: true,
    onChange: function(v) {
      result.on_volume_slider_seek(v)
    },
    value: 100 * this.volume
  })

  var loadLayer = self.elem.querySelector('.load-layer')
  data.video_url
    ? (data.img && loadLayer.querySelector('img').setAttribute('src', data.img),
      (loadLayer.onclick = function() {
        self.start_video()
      }))
    : loadLayer.classList.add('hide')

  if (data.preload) {
    var element = this.elem.querySelector('video')
    if ('audio' === data.type) {
      element = this.elem.querySelector('audio')
    }

    var source = document.createElement('source')
    dom.appendTo(source, element)
    source.setAttribute('src', data.video_url)
    source.setAttribute('type', data.video_type)
    this.video = element

    element.addEventListener(
      'play',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(player.E_VIDEO_PLAY)
        }
        self.on_video_play(element)
      },
      {
        passive: true
      }
    )

    element.addEventListener('playing', function() {
      self.on_video_playing(element)
    })

    element.addEventListener('pause', function() {
      if (self.options.eventBus) {
        self.options.eventBus.dispatch(player.E_VIDEO_PAUSE)
      }
      self.on_video_pause(element)
    })

    element.addEventListener(
      'waiting',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(player.E_VIDEO_WAITING)
        }
        self.on_video_waiting(element)
      },
      {
        passive: true
      }
    )

    element.addEventListener(
      'loadstart',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(player.E_VIDEO_LOADSTART)
        }
        self.on_video_loadstart(element)
      },
      {
        passive: true
      }
    )

    element.addEventListener('canplay', function() {
      if (self.options.eventBus) {
        self.options.eventBus.dispatch(player.E_VIDEO_CANPLAY)
      }
      self.on_video_canplay(element)
    })

    element.addEventListener(
      'ended',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(player.E_VIDEO_ENDED)
        }
        self.on_video_ended(element)
      },
      {
        passive: true
      }
    )

    element.addEventListener(
      'loadeddata',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(player.E_VIDEO_LOADED)
        }
      },
      {
        passive: true
      }
    )

    element.addEventListener(
      'error',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(player.E_VIDEO_ERROR)
        }
      },
      {
        passive: true
      }
    )

    element.addEventListener(
      'timeupdate',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(player.E_VIDEO_TIME)
        }
      },
      {
        passive: true
      }
    )

    element.addEventListener(
      'seeking',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(player.E_VIDEO_SEEK)
        }
      },
      {
        passive: true
      }
    )
  }

  if (/iPad/.test(window.navigator.userAgent)) {
    self.elem.querySelector('.btn-mute').classList.add('hide')
    self.elem.querySelector('.control-volume-slider').classList.add('hide')
    self.elem.querySelector('.btn-fullscreen').classList.add('hide')
    self.elem.querySelector('.control-bar').classList.add('ipad')
  } else {
    self.elem.querySelector('.btn-mute').classList.add('hide')
    self.elem.querySelector('.control-volume-slider').classList.add('hide')
    self.elem.querySelector('.btn-fullscreen').classList.add('hide')
    self.elem.querySelector('.btn-repeat').classList.add('hide')
  }
}

player.prototype.init_video = function(url, type, preload) {
  url = url || ''
  type = type || 'video/mp4'

  var self = this
  var element = this.elem.querySelector('video')

  'audio' === this.options.type && (element = this.elem.querySelector('audio'))
  this.video = element

  if (!preload) {
    this.play_video()
    var source = document.createElement('source')
    dom.appendTo(source, element)

    source.setAttribute('src', url)
    source.setAttribute('type', type)

    element.addEventListener(
      'play',
      function() {
        if (this.options.eventBus) {
          self.options.eventBus.dispatch(player.E_VIDEO_PLAY)
        }
        self.on_video_play(element)
      },
      {
        passive: true
      }
    )

    element.addEventListener('playing', function() {
      self.on_video_playing(element)
    })

    element.addEventListener(
      'pause',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(player.E_VIDEO_PAUSE)
        }
        self.on_video_pause(element)
      },
      {
        passive: true
      }
    )

    element.addEventListener(
      'waiting',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(player.E_VIDEO_WAITING)
        }
        self.on_video_waiting(element)
      },
      {
        passive: true
      }
    )

    element.addEventListener(
      'loadstart',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(player.E_VIDEO_LOADSTART)
        }
        self.on_video_loadstart(element)
      },
      {
        passive: true
      }
    )

    element.addEventListener('canplay', function() {
      if (self.options.eventBus) {
        self.options.eventBus.dispatch(fn.E_VIDEO_CANPLAY)
      }
      self.on_video_canplay(element)
    })

    element.addEventListener(
      'ended',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(fn.E_VIDEO_ENDED)
        }
        self.on_video_ended(element)
      },
      {
        passive: true
      }
    )

    element.addEventListener(
      'loadeddata',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(fn.E_VIDEO_LOADED)
        }
      },
      {
        passive: true
      }
    )

    element.addEventListener(
      'error',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(fn.E_VIDEO_ERROR)
        }
      },
      {
        passive: true
      }
    )

    element.addEventListener(
      'timeupdate',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(fn.E_VIDEO_TIME)
        }
      },
      {
        passive: true
      }
    )

    element.addEventListener(
      'seeking',
      function() {
        if (self.options.eventBus) {
          self.options.eventBus.dispatch(fn.E_VIDEO_SEEK)
        }
      },
      {
        passive: true
      }
    )
  }

  this.timer = setInterval(function() {
    self.on_timer_interval()
  }, 100)

  this.set_video_state(player.V_READY)
}

player.prototype.on_video_play = function() {
  this.set_video_state(player.V_PLAY)
}

player.prototype.on_video_playing = function() {
  this.set_video_state(player.V_PLAYING)
}

player.prototype.on_video_pause = function() {
  this.set_video_state(player.V_PAUSE)
}

player.prototype.on_video_waiting = function() {
  this.set_video_state(player.V_BUFF)
}

player.prototype.on_video_loadstart = function() {
  this.set_video_state(player.V_BUFF)
}

player.prototype.on_video_canplay = function() {
  this.set_video_state(player.V_CANPLAY)
}

player.prototype.on_video_ended = function() {
  this.set_video_state(player.V_COMPLETE)
}

player.prototype.set_video_state = function(state) {
  var presetItemClicked = this.video_state
  if (presetItemClicked !== state && this.elem.querySelector('.state-icon i')) {
    this.elem.querySelector('.state-icon i').classList.remove('active')
    switch (state) {
      case player.V_READY:
        if (this.options.eventBus) {
          this.options.eventBus.dispatch(player.E_VIDEO_READY, {
            play: this.play.bind(this),
            pause: this.pause.bind(this),
            seek: this.seek.bind(this),
            getDuration: this.getDuration.bind(this),
            isFullScreen: this.isFullScreen
          })
        }
        break
      case player.V_PLAY:
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
      case player.V_PAUSE:
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
      case player.V_BUFF:
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
      case player.V_COMPLETE:
        this.elem
          .querySelector('.state-icon i.pause-icon')
          .classList.add('active')
        break
      case player.V_CANPLAY:
        if (dom.hasClass('.load-layer', 'hide')) {
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
      case player.V_PLAYING:
        this.set_control_bar_visible(false)
        this.elem
          .querySelector('.state-icon i.play-icon')
          .classList.add('active')
        this.elem
          .querySelector('.state-icon i.pause-icon')
          .classList.remove('active')
    }
    if (state !== player.V_PLAY) {
      this.elem.querySelector('.player-box').classList.remove('full')
      this.set_control_bar_visible(true)
    }
    /** @type {number} */
    this.video_state = state

    this.on_state_change(this.video_state, presetItemClicked)
  }
}

player.prototype.on_state_change = function(obj, event) {
  if (this.options.on_state_change) {
    this.options.on_state_change(obj, event)
  }
}

player.prototype.get_video_state = function() {
  return this.video_state
}

player.prototype.start_video = function() {
  var self = this
  var options = this.options
  this.elem.querySelector('.load-layer').classList.add('hide')
  this.init_video(options.video_url, options.video_type, options.preload)
  this.init_comment()

  if (!this.options.autoplay) {
    this.play_video()
  }

  if (!('audio' === this.options.type)) {
    this.elem.querySelector('video').classList.add('show')
    this.elem.querySelector('video').style.display = 'inline'
  }

  this.set_control_bar_visible(false)

  dom.addEvent(
    this.elem.querySelector('.state-icon i.play-icon'),
    'click',
    function() {
      if (dom.hasClass(this, 'active')) {
        self.pause_video()
      }
    }
  )

  dom.addEvent(
    this.elem.querySelector('.state-icon i.pause-icon'),
    'click',
    function() {
      self.play_video()
    }
  )
}

player.prototype.pause_video = function() {
  var video = this.video
  if (video) {
    video.pause()
  }
}

player.prototype.play_video = function() {
  var video = this.video
  var userAgent = window.navigator.userAgent
  var media = document.querySelectorAll('video')

  if (video) {
    if (
      userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ||
      userAgent.indexOf('iPad') > -1
    ) {
      var i = 0
      for (; i < media.length; i++) {
        media[i].pause()
      }
    }

    video.play()

    if (!this.tracked && this.options.track) {
      this.tracked = true
      this.send_track()
    }
  }
}

player.prototype.set_duration = function(d) {
  this.duration = d
}

player.prototype.seek_video = function(t) {
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

player.prototype.set_volume = function(value) {
  this.volume = value
  if (this.video) {
    this.video.volume = value
  }
}

player.prototype.video_time = function() {
  return this.currentTime
}

player.prototype.video_duration = function() {
  return this.duration
}

player.prototype.on_timer_interval = function() {
  this.update_time(this.video.currentTime, this.video.duration)
}

player.prototype.on_slider_seek = function(template) {
  this.seek_video(template)
}

player.prototype.on_volume_slider_seek = function(a) {
  this.set_volume(a / 100)
}

player.prototype.update_time = function(value, duration) {
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
      this.elem.querySelector('.time-total-text').innerText = dom.formatTime(
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
      this.elem.querySelector('.time-current-text').innerText = dom.formatTime(
        value > this.maxDuration ? this.maxDuration : value
      )
    }
  }
}

player.prototype.to_wide_screen = function() {
  switch (this.screen_state) {
    case player.UI_NORMAL:
      this.elem.querySelector('.player-box').classList.add('wide')
      break
    case player.UI_FULL:
      this.elem.querySelector('.player-box').classList.remove('full')
      this.set_control_bar_visible(true)
      player.exitFullscreen()
  }

  try {
    window.player_fullwin(true)
  } catch (t) {}

  this.elem.querySelector('.btn-widescreen').classList.add('active')
  /** @type {number} */
  this.screen_state = player.UI_WIDE
  this.comment_stage_resize()
}

player.prototype.to_normal_screen = function() {}

player.prototype.to_full_screen = function() {}

player.prototype.on_fullscreen_change = function() {}

player.prototype.on_display_mousemove = function() {}

player.prototype.on_display_click = function() {}

player.prototype.on_play_btn_click = function() {}

player.prototype.on_send_btn_click = function() {}

player.prototype.on_keydown = function() {}

player.prototype.on_pause_btn_click = function() {}

player.prototype.on_share_btn_click = function() {}

player.prototype.on_comment_btn_click = function() {}

player.prototype.on_repeat_btn_click = function() {}

player.prototype.on_mute_btn_click = function() {}

player.prototype.on_unmute_btn_click = function() {}

player.prototype.set_control_bar_visible = function(status, delay) {
  var self = this
  clearTimeout(this.control_bar_timer)

  if (status !== this.control_bar_visible) {
    if (status) {
      this.elem.querySelector('.control-bar').classList.remove('hide')
      this.elem.querySelector('.state-icon').classList.remove('hide')

      this.control_bar_visible = true
    } else {
      if (this.hidePlayIcon) {
        this.hidePlayIcon = false
      } else {
        this.elem.querySelector('.state-icon').classList.remove('hide')
      }

      this.control_bar_timer = setTimeout(function() {
        self.elem.querySelector('.control-bar').classList.add('hide')
        self.elem.querySelector('.state-icon').classList.add('hide')
        self.control_bar_visible = false
      }, delay || 0)
    }
  }
}

player.prototype.init_comment = function() {
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

  var cmtFileUri = self.options.cmt_url || ''

  if (self.options.get_cmt_url) {
    /** @type {string} */
    cmtFileUri = self.options.get_cmt_url + self.options.cid + '.xml'
  }

  if (this.live_mode) {
    stage.config().setLiveMode(true)
    stage.connect(
      cmtFileUri,
      function(comment) {
        self.stage.addCmt(comment)
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
    stage.loadCmtFile(cmtFileUri, function(url) {
      return self.options.get_cmt_url
        ? url
        : url.replace(/comment\.bilibili\.[^\/]+/, function() {
            return 'comment.bilibili.com'
          })
    })
  }
  this.comment_stage_resize()
  stage.play()
}

player.prototype.comment_stage_resize = function() {
  if (!this.stage) {
    return false
  }
  this.stage.resize(this.elem.offsetWidth, this.elem.offsetHeight)
}

player.prototype.send_comment = function(value, n, func) {
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

player.prototype.getCookie = function(name) {
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

player.prototype.ws = function() {
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
      array.set(b, a.byteLength)

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
      return window.TextEncoder
        ? new window.TextEncoder()
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
        debugger
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

  this.websocket.connect()
}

player.prototype.send_track = function() {
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

player.prototype.get_system_time = function(data) {
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

player.prototype.send_report_click = function(success) {
  action.a.post(
    '//api.bilibili.com/x/report/click/h5',
    store.a.stringify(success),
    {
      withCredentials: true
    }
  )
}

export default player
