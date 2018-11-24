# micromock-node
Minimal HTTP Request / Response object for node js

Initiall implemented for [skyring](https://github.com/esatterwhite/skyring) and a replacement for [hammock](https://github.com/doanythingfordethklok/hammock)
for use in [ringpop](https://github.com/esatterwhite/ringpop-node) while adding support for node >= 10

```js
const {Request, Response} = require('micromock')

var req = new new Request({
        url: '/foo',
        headers: { host: 'localhost', bar: 'baz' },
        method: 'GET'
    }),
    res = new Response();

res.on('end', function(err, data) {
     console.log(data.statusCode);
     console.log(util.inspect(data.headers));
     console.log(data.body);
});
```
