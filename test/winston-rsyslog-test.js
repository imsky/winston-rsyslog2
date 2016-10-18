/*
 * winston-rsyslog-test.js: Tests for instances of the Rsyslog transport
 *
 * (C) 2013-2015 Fabio Grande
 * MIT LICENSE
 *
 */

var path = require('path'),
  vows = require('vows'),
  assert = require('assert'),
  winston = require('winston'),
  helpers = require('winston/test/helpers'),
  Rsyslog = require('../lib/winston-rsyslog').Rsyslog;

var tokenTransport, config;

try {
  config = require('./config');
  console.log('Using configuration file test/config.json.');
  tokenTransport = new Rsyslog(config.transports.rsyslog);
} catch (e) {
  console.log('Cannot read file test/config.json. Using defaults.');
  tokenTransport = new Rsyslog();
}

function assertRsyslog(transport) {
  assert.instanceOf(transport, Rsyslog);
  assert.isFunction(transport.log);
}

vows.describe('winston-rsyslog').addBatch({
    'An instance of the Rsyslog Transport': {
        'should have the proper methods defined': function() {
            assertRsyslog(tokenTransport);
        },
        'the log() method': helpers.testSyslogLevels(tokenTransport, 'should log messages to rsyslog', function(ign, err, logged) {
            assert.isNull(err);
            assert.isTrue(logged);
        })
    },
    'An instance with default options': {
        'should have "U" protocol, downgraded to "U4" because host is "localhost"': function() {
            assert((new Rsyslog()).host, "localhost");
            assert((new Rsyslog()).protocol, "U4");
        },
    },
    'An instance with U protocol': {
      'and IPv4 host should have "U4" protocol': function() {
        assert.equal(new Rsyslog({host: '127.0.0.1'}).protocol, 'U4');
      },
      'and IPv6 host should have "U6" protocol': function() {
        assert.equal(new Rsyslog({host: '::1'}).protocol, 'U6');
      },
      'and domain in host option should have "U4" protocol': function() {
        assert.equal(new Rsyslog({host: 'example.com'}).protocol, 'U4');
      },
    },
    'An instance with "U6" protocol and domain in host option should have "U6" protocol': function() {
      assert.equal(new Rsyslog({host: 'example.com', protocol: 'U6'}).protocol, 'U6');
    },
    'An instance with "U5" protocol should throws Error': function() {
      assert.throws(function() {return new Rsyslog({protocol: 'U5'})}, /Undefined Protocol/);
    }
}).export(module);
