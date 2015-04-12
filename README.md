# express-lru
[![NPM version](http://img.shields.io/npm/v/express-lru.svg?style=flat)](https://www.npmjs.org/package/express-lru)
[![Build Status](http://img.shields.io/travis/naturalatlas/express-lru/master.svg?style=flat)](https://travis-ci.org/naturalatlas/express-lru)
[![Coverage Status](http://img.shields.io/coveralls/naturalatlas/express-lru/master.svg?style=flat)](https://coveralls.io/r/naturalatlas/express-lru)

[Express](http://expressjs.com/) middleware that serves as a stopgap for [Varnish](http://en.wikipedia.org/wiki/Varnish_%28software%29) – for times when you don't have time to set up Varnish or want something simpler. A few notes:

 - It will only cache `200`-status responses.
 - Response headers (like `Content-Type`) will be cached and served like normal.
 - Supports JSON, Buffers, and Strings.
 - Has a "skip" option that allows for control of what requests bypass the cache. In most cases you’ll want to return `true` for logged in users.

### Example Usage

```js
var expresslru = require('express-lru');
var cache = expresslru({ttl: 60000, skip: function(req) { return !!req.user; }});

app.get('/myroute', cache, function(req, res, next) {
    // ...
});
```

## License

Copyright &copy; 2015 [Natural Atlas, Inc.](https://github.com/naturalatlas) & [Contributors](https://github.com/naturalatlas/express-lru/graphs/contributors)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
