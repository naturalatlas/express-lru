var async = require('async');
var assert = require('chai').assert;
var request = require('supertest');
var express = require('express');
var lru = require('../index.js');

function runsequence(expectSkip, route, options, test, done) {
	var app = express();
	var agent = request.agent(app);
	options.ttl = 50;

	// wrap the route to count the number of times it's executed
	var executions = 0;
	app.get('/route', lru(options), function(req, res, next) {
		executions++;
		route(req, res, next);
	});

	// execute tests against the route
	function executeTest(delay, expectedExecutions, callback) {
		setTimeout(function() {
			var _agent = agent.get('/route');
			test(_agent);
			_agent.end(function(err) {
				if (err) return callback(err);
				if (!expectSkip) assert.equal(executions, expectedExecutions);
				callback();
			});
		}, delay);
	}
	async.parallel([
		function(callback) { executeTest(0, 1, callback); },
		function(callback) { executeTest(0, 1, callback); },
		function(callback) { executeTest(0, 1, callback); },
		function(callback) { executeTest(100, 2, callback); }
	], function(err) {
		if (err) throw err;
		if (expectSkip) assert.equal(executions, 4);
		done();
	});
}

describe('express-lru middleware', function() {
	describe('res.json()', function() {
		it('should work normally', function(done) {
			var route = function(req, res, next) {
				res.json({hello:'world'});
			};
			runsequence(false, route, {}, function(agent) {
				agent
					.expect('Content-Type', /application\/json/)
					.expect('{"hello":"world"}')
					.expect(200);
			}, done);
		});
	});
	describe('res.send()', function() {
		it('should work normally', function(done) {
			var route = function(req, res, next) {
				res.set({'Content-Type': 'text/test'}).send('the content');
			};
			runsequence(false, route, {}, function(agent) {
				agent
					.expect('Content-Type', /text\/test/)
					.expect('the content')
					.expect(200);
			}, done);
		});
		it('should work normally with Buffer', function(done) {
			var route = function(req, res, next) { res.set({'Content-Type': 'text/test'}).send(new Buffer('hello')); };
			runsequence(false, route, {}, function(agent) {
				agent
					.expect('Content-Type', /text\/test/)
					.expect('hello')
					.expect(200);
			}, done);
		});
		it('should work normally with json', function(done) {
			var route = function(req, res, next) { res.set({'Content-Type': 'text/test'}).send({a:'b'}); };
			runsequence(false, route, {}, function(agent) {
				agent
					.expect('Content-Type', /text\/test/)
					.expect('{"a":"b"}')
					.expect(200);
			}, done);
		});
	});

	it('should not cache non-200 responses', function(done) {
		var route = function(req, res, next) {
			res.set({'Content-Type':'text/plain'}).status(500).send('the content');
		};
		runsequence(true, route, {}, function(agent) {
			agent
				.expect('Content-Type', /text\/plain/)
				.expect('the content')
				.expect(500);
		}, done);
	});

	it('should acknowledge "skip" option', function(done) {
		var route = function(req, res, next) {
			res.set({'Content-Type': 'text/test'}).send('the content');
		};
		var skip = function(req) { return true; };
		runsequence(true, route, {skip: skip}, function(agent) {
			agent
				.expect('Content-Type', /text\/test/)
				.expect('the content')
				.expect(200);
		}, done);
	});
})
