var path = require('path')
  , dotenv = require('dotenv')
  , pkg = require(path.resolve(__dirname, 'package.json'))
  , env = process.env.NODE_ENV || 'development'
  , util = require('core-util-is')

function extend(origin, add) {
  /* istanbul ignore next */
  if (!add || !util.isObject(add)) {
    return origin
  }

  var keys = Object.keys(add)
  var i = keys.length
  while (i--) {
    if (!origin.hasOwnProperty(keys[i])) {
      origin[keys[i]] = add[keys[i]]
    }
  }
  return origin
}

dotenv.load()

var defaults = {
  db: {
    name: process.env.DB_NAME
  , user: process.env.DB_USER || 'root'
  , pass: process.env.DB_PASSWORD || 'root'
  , opts: {
      dialect: process.env.DB_DIALECT || 'mysql'
    , host: process.env.DB_HOST || '127.0.0.1'
    , port: process.env.DB_PORT || 3306
    }
  }
, loglevel: process.env.LOGLEVEL || 'trace'
}

var config = {
  development: extend({
    loglevel: process.env.LOGLEVEL || 'trace'
  }, defaults)
, staging: extend({
    loglevel: process.env.LOGLEVEL || 'error'
  }, defaults)
, test: extend({
    loglevel: process.env.LOGLEVEL || 'silent'
  }, defaults)
, production: extend({
    loglevel: process.env.LOGLEVEL || 'error'
  }, defaults)
}

module.exports = config[env]
