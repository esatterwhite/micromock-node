'use strict'

const {OutgoingMessage} = require('http')
const stream = require('stream')

module.exports = class Response extends OutgoingMessage {
  constructor(cb){
    super()
    this.statusCode = 200
    this.buffer = []
    this.on('data', (chunk) => {
      this.buffer.push(chunk)
    })

    this.on('close', () => {})

    if (typeof cb === 'function') {
      const cleanup = function() {
        this.removeListener('error', cleanup)
        this.removeListener('response', cleanup)
        cb.apply(this, arguments)
      }
      this.once('error', cleanup)
      this.once('response', cleanup)
    }

    // node <= 6
    if (typeof this.getHeaders !== 'function') {
      this.getHeaders = function() {
        return this._headers
      }
    }
  }

  writeHead(statusCode, headers) {
    const keys = Object.keys(headers || Object.create(null))
    this.statusCode = statusCode || this.statusCode
    for (let idx = 0; idx < keys.length; idx++) {
      const header = keys[idx]
      this.setHeader(header, headers[header])
    }
  }

  end(str) {
    if (this.finished) return

    if (str) this.buffer.push(str)
    const body = this._buildBody()
    const headers = this.getHeaders()
    this.emit('close')
    this.emit('finish')

    this.emit('end', null, {
      statusCode: this.statusCode
    , body: body
    , headers: headers
    })

    this.emit('response', null, {
      statusCode: this.statusCode
    , body: body
    , headers: headers
    })

    this.finished = true
    this.removeAllListeners()
  }

  _implicitHeader() {
    this.writeHead(this.statusCode);
  }

  _send(chunk, encoding, cb) {
    this.buffer.push(chunk)
  }

  _buildBody() {
    if (!this.buffer.length) return ''
    if (this.buffer.length === 1) return this.buffer[0]

    var isBuffers = true;
    for (var i = 0; i < this.buffer.length; i++) {
      if (!Buffer.isBuffer(this.buffer[i])) {
        isBuffers = false
      }
    }

    if (!isBuffers) return this.buffer.join('')
    return Buffer.concat(this.buffer)
  }
}
