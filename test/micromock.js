'use strict'

const {PassThrough} = require('stream')
const {test, threw} = require('tap')
const {Request, Response} = require('../lib')

test('minimock#Request', (t) => {
  t.test('can write header values', (tt) =>{
    const req = new Request({
      url: '/fake?key=value'
    , headers: {'x-fake': 'test'}
    })
    tt.ok(req, 'request was created')

    req.setHeader('X-TEST', 'fake')
    tt.deepEqual(req.headers, {
      'x-fake': 'test'
    , 'x-test': 'fake'
    , 'transfer-encoding': 'chunked'
    }, 'headers set')

    tt.equal(req.getHeader('x-test'), 'fake', 'can lookup single header')
    tt.deepEqual(req.query, {key: 'value'}, 'query string parsed')
    tt.end()
  })

  t.test('can specify payload', (tt) => {
    tt.plan(1)
    const req = new Request({
      url: '/fake?key=value'
    , headers: {'x-fake': 'test'}
    , payload: JSON.stringify({a: 1, b: 2})
    })

    const stream = new PassThrough()

    stream.once('data', (chunk) => {
      const found = JSON.parse(chunk)
      tt.deepEqual(found, {a: 1, b: 2}, 'can pipe request payload')
    })
    req.pipe(stream)
  })
  t.end()
}).catch(threw)

test('minimock#Response', (t) => {
  t.test('can write to response', (tt) => {
    const res = new Response((err, resp) => {
      tt.equal(resp.body, 'foobar')
      tt.deepEqual(resp.headers, {'x-foobar': 1}, 'headers set')
      tt.equal(resp.statusCode, 201, 'statuscode set')
      tt.end()
    })

    res.writeHead(201, {
      'X-FOOBAR': 1
    })

    res.write('foo')
    res.write('bar')
    res.end()
  })

  t.test('can write buffers to response', (tt) => {
    const res = new Response((err, response) => {
      tt.equal(response.body, 'foobar')
      tt.end()
    })

    res.write('foo')
    res.write(Buffer.from('bar'))
    res.end()
  })
  t.test('can write buffers to end()', (tt) => {
    const res = new Response((err, response) => {
      tt.equal(
        response.body.toString('hex')
      , Buffer.from('foobar').toString('hex')
      )
      tt.end()
    })

    res.end(Buffer.from('foobar'))
  })

  t.test('can write only buffers to response', (tt) => {
    const res = new Response((err, response) => {
      tt.equal(
        response.body.toString('hex')
      , Buffer.from('barfoo').toString('hex')
      )
      tt.end()
    })

    res.write(Buffer.from('bar'))
    res.write(Buffer.from('foo'))
    res.end()
  })

  t.test('can writ only buffers to response with pipe', (tt) => {
    const res = new Response((err, response) => {
      tt.equal(
        response.body.toString('hex')
      , Buffer.from('foobar').toString('hex')
      )
      tt.end()
    })
    const stream = new PassThrough()
    stream.pipe(res)
    stream.write(Buffer.from('foo'))
    stream.write(Buffer.from('bar'))
    stream.end()
  })

  t.test('empty responses', (tt) => {
    const res = new Response((err, response) => {
      tt.strictEqual(response.body, '')
      tt.end()
    })

    const stream = new PassThrough()
    stream.pipe(res)
    debugger;
    stream.end()
  })
  t.end()
}).catch(threw)
