'use strict'

const Url = require('url')
const {OutgoingMessage} = require('http')
const {Readable} = require('stream')

module.exports = class Request extends Readable {
  constructor (options) {
    super()

    this.body = ''
    this.httpVersion = '1.1'
    this.url = options.url || '/'
    this.query = Url.parse(this.url, true).query
    this.method = options.method || 'GET'
    this.payload = options.payload
    const symbols = Object.getOwnPropertySymbols(new OutgoingMessage())
    const headers = options.headers || Object.create(null)

    for (const symbol of symbols ){
      this[symbol] = null
    }
    for (const [header, value] of Object.entries(headers)) {
      this.setHeader(header, value)
    }

    // node <= 6
    if (typeof this.getHeaders !== 'function') {
      this.getHeaders = function() {
        return this._headers
      }
    }
    this.setHeader('transfer-encoding', 'chunked')
  }

  _read(){

    if(this.payload){
      this.push(this.payload);
      this.payload = null;
      return;
    }

    this.push(null);

  }

  setHeader(header, value) {
    return OutgoingMessage.prototype.setHeader.call(this, header, value)
  }
  getHeader(header, value) {
    return OutgoingMessage.prototype.getHeader.call(this, header, value)
  }
  getHeaders(header, value) {
    return OutgoingMessage.prototype.getHeaders.call(this)
  }
}

Object.defineProperties(module.exports.prototype, {
  headers: {
    get: function () {
      return this.getHeaders()
    }
  }
})
