var log = require('xnpmlog').createLogger('migrate')
  , config = require('../config')
  , EE = require('events').EventEmitter
  , util = require('util')
  , Sequelize = require('sequelize')
  , path = require('path')
  , fs = require('fs')

function DB() {
  EE.call(this)

  log.trace('initialized')

  config.db.opts.logging = function(str) {
    if (config.loglevel === 'trace' || config.loglevel === 'silly') {
      log.trace(str)
    }
  }

  this.sequelize = new Sequelize(
    config.db.name
  , config.db.user
  , config.db.pass
  , config.db.opts
  )

  this.models = {}
  this.connected = false
}

util.inherits(DB, EE)

DB.prototype.connect = function() {
  var self = this

  if (this.connected) {
    return false
  }

  this.sequelize.authenticate().complete(function(err) {
    if (err) {
      log.error('Sequelize error', err)
      self.emit('error', err)
    } else {
      log.trace('Sequelize connected')
      var model = self.sequelize.import(path.join(__dirname, 'sequelize_model'))
      self.models[model.name] = model

      self.connected = true
      self.emit('connected')
    }
  })
}

DB.prototype.disconnect = function() {
  this.sequelize.close()
  this.connected = false
}

exports = module.exports = new DB()
