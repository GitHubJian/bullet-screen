function Connection(options, createWSUrl, flipTables, emptyChar2null) {
  this.ta = options
  this.createWSUrl =
    createWSUrl ||
    function(canCreateDiscussions) {
      return 'ws://wschat.bilibili.com:8088/' + canCreateDiscussions
    }
  this.fa = flipTables
  this.ga = emptyChar2null || window.PlayerSetOnline
  this.WebSocket = window.WebSocket || window.MozWebSocket
}

Connection.prototype.constructor = Connection

Connection.prototype.A = null

Connection.prototype.Na = 0

Connection.prototype.G = false

Connection.prototype.da = -1

Connection.prototype.ba = function() {
  if (!this.WebSocket) {
    return false
  }
  var f = this
  this.G = false

  this.A = new this.WebSocket(this.createWSUrl(this.ta))
  this.A.onmessage = function(message) {
    f.La(message.data)
  }
  this.A.onclose = function() {
    if (!f.G) {
      if (-1 == f.da || f.Na++ < f.da) {
        setTimeout(function() {
          f.ba()
        }, 1e3)
      }
    }
  }
}

Connection.prototype.close = function() {
  this.G = true
  this.A.close()
}

Connection.prototype.La = function(data) {
  var e = parseInt('0x' + data.substr(0, 4))
  if ((data = data.substr(4, e)).length != e) {
    console.log('Packet invalid')
  } else {
    switch ((data = JSON.parse(data)).pkt_id) {
      case 1:
        var cleanedArgs = JSON.parse(data.payload)
        setTimeout(function() {
          if ('function' == typeof this.ga) {
            this.ga(cleanedArgs)
          }
        }, 1)
        break
      case 2:
        e = (data = JSON.parse(data.payload))[1]
        data = data[0].split(',')
        data = {
          stime: parseFloat(data[0]),
          mode: parseInt(data[1]),
          size: parseInt(data[2]),
          color: parseInt(data[3]),
          date: parseInt(data[4]),
          rnd: data[5],
          class: parseInt(data[6]),
          hash: data[7],
          dmid: data[8],
          text: e
        }

        if ('function' == typeof this.fa) {
          this.fa(data)
        }
    }
  }
}

export default Connection
