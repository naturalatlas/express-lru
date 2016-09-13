var AsyncCache = require('async-cache');
var noop = function() {};

module.exports = function(options) {
	var ttl = options.ttl || 30000;
	var max = options.max || 1000;
	var loader = new AsyncCache({max: max, maxAge: ttl, load: noop});
	var hasher = options.hasher || function(req) {
		return req.originalUrl;
	};

	return function(req, res, next) {
		if (options.skip && options.skip(req)) {
			return next();
		}

		var original_send = res.send;
		loader._load = function(key, callback) {
			res.send = function() {
				var body = arguments[arguments.length - 1];
				if (body && (typeof body === 'object' || Array.isArray(body)) && !Buffer.isBuffer(body)) {
					body = new Buffer(JSON.stringify(body), 'utf8');
				}
				// we skip caching by returning an "error" to async-cache)
				var nocache = res.statusCode && res.statusCode !== 200;
				callback(nocache, {
					body: body,
					headers: res._headers,
					status: res.statusCode
				});
			};
			next();
		};

		var key = hasher(req);
		loader.get(key, function(nocache, data) {
			if (data.headers) res.set(data.headers);
			original_send.apply(res, [data.body]);
		});
	};
};
