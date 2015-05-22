/*
 * winston-rsyslog: Transport for logging to remote syslog
 *
 * (C) 2013-2015 Fabio Grande
 * MIT LICENSE
 */

var events = require('events'),
  dgram = require('dgram'),
  net = require('net'),
  os = require('os'),
  util = require('util'),
  winston = require('winston'),
  Transport = winston.Transport;

/**
 * Constructor function for the rsyslog transport object responsible
 * for sending messages to syslog daemon
 * @param {Object} [options] Options for this instance
 * @constructor
 */
var Rsyslog = exports.Rsyslog = function (options) {
  options = options || {};
  Transport.call(this, options);

  this.name = 'rsyslog';
  this.host = options.host || 'localhost';
  this.port = options.port || 514;
  this.facility = options.facility || 0;
  this.protocol = options.protocol || 'U';
  this.hostname = options.hostname || os.hostname();
  this.tag = options.tag || 'winston';
  this.timeout = options.timeout || 2000;
  this.levelMapping = options.levelMapping || {};
  this.dateProvider = options.dateProvider || dateProviderDefault;
  this.messageProvider = options.messageProvider || messageProviderDefault;

  if (this.facility > 23 || this.facility < 0) {
    throw new Error('Facility index is out of range! (valid range is 0..23)');
  }

  if (this.protocol != 'U' && this.protocol != 'T') {
    throw new Error('Undefined Protocol! (valid options are U or T)');
  }
};

// Inherit from `winston.Transport`.
util.inherits(Rsyslog, winston.Transport);

// Add a new property to expose the new transport....
winston.transports.Rsyslog = Rsyslog;

// Expose the name of this Transport on the prototype
Rsyslog.prototype.name = 'rsyslog';

/**
 * Core logging method exposed to Winston. Metadata is optional.
 * @param {string} level Level at which to log the message
 * @param {string} msg Message to log
 * @param {Object} [meta] Additional metadata to attach
 * @callback callback Called on completion
 */
Rsyslog.prototype.log = function (level, msg, meta, callback) {
  if (this.silent) {
    return callback(null, true);
  }

  // If the specified level is not included in the syslog list, convert it to 'debug'
  var _severity = 7;
  if (this.levelMapping[level] !== undefined) {
    _severity = this.levelMapping[level];
  }

  var _pri = (this.facility << 3) + _severity;
  var _date = this.dateProvider();
  var _message = this.messageProvider(level, msg, meta);
  var _buffer = new Buffer('<' + _pri + '>' + _date + ' ' + this.hostname + ' ' + this.tag + ' ' + _message);

  if (this.protocol === 'U') {
    sendUdp(this, _buffer, callback);
  } else if (this.protocol === 'T') {
    sendTcp(this, _buffer, callback);
  }
};

function sendUdp(self, buffer, callback) {
  var client = dgram.createSocket('udp4');
  client.send(buffer, 0, buffer.length, self.port, self.host, function (err) {
    if (err) {
      if (callback) {
        return callback(err);
      }
      throw err;
    }

    self.emit('logged');

    if (callback) {
      callback(null, true);
    }

    client.close();
  });
}

function sendTcp(self, buffer, callback) {
  var socket = net.connect(self.port, self.host, function () {
    socket.end(buffer + '\n');

    self.emit('logged');

    if (callback) {
      callback(null, true);
    }
  });

  socket.setTimeout(self.timeout);

  socket.on('error', function (err) {
    socket.destroy();
    if (callback) {
      return callback(err);
    }

    throw err;
  });

  socket.on('timeout', function (err) {
    socket.destroy();
    if (callback) {
      return callback(err);
    }

    throw err;
  });
  return callback;
}

var dateProviderDefault = function () {
  return new Date().toISOString();
};

var messageProviderDefault = function (level, msg, meta) {
  var message = process.pid + ' - ' + level + ' - ' + msg;
  if (meta && (typeof meta !== 'object' || Object.keys(meta).length)) {
    message += ' ' + util.inspect(meta);
  }
  return message;
};
