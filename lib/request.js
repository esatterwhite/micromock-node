'use strict'

const Url = require('url')
const {Readable} = require('stream')

module.exports = class Request extends Readable {
  constructor (options) {
    super()
    this.body = ''
    this.httpVersion = '1.1'
    this.payload = options.payload
    this.url = options.url || '/'
    this.query = Url.parse(this.url, true).query
    this.headers = options.headers || {}
    this.method = options.method || 'GET'
    this._headerNames = {}
    this._removedHeader = {}
    this.setHeader('transfer-encoding', 'chunked')

  }
  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value
  }
  getHeader(name){
    return this.headers[name.toLowerCase()]
  }

  _read() {
    if (this.payload) {
      this.push(this.payload)
      this.payload = null
      return
    }
    this.push(null)
  }
}
