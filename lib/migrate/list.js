var EventEmitter = require('events').EventEmitter
  , db = require('../db')
  , util = require('util')

module.exports = List

/**
 * Initialize a new migration `List`
 * which is used to store data between migrations.
 *
 * @param {String} path
 * @api private
 */

function List() {
  this.migrations = []
  this.pos = 0
}

util.inherits(List, EventEmitter)

/**
 * Save the migration data and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

List.prototype.save = function(pos, fn) {
  var self = this
    , emit = pos === null ? true : false

  pos = pos === null ? this.migrations.length - 1 : pos

  db.models.Migration
    .bulkCreate(this.migrations, {ignoreDuplicates: true})
    .done(function() {
      db.models.Migration.update({current: false}, {where: {}})
        .then(function() {
          db.models.Migration
            .findAll({order: 'title ASC'})
            .then(function(migrations) {
              if (emit && !migrations) {
                self.emit('save')
                return fn()
              }

              if (!migrations[pos]) {
                if (emit) {
                  self.emit('save')
                }
                fn()
              }

              migrations[pos].current = true
              migrations[pos].save('current')
                .then(function() {
                  if (emit) {
                    self.emit('save')
                  }
                  fn()
                })
                .catch(function(err) {
                  fn(err)
                })
            })
          })
    })
}

/**
 * Load the migration data and call `fn(err, obj)`.
 *
 * @param {Function} fn
 * @return {Type}
 * @api public
 */

List.prototype.load = function(fn) {
  this.emit('load')

  db.models.Migration
    .findAll({where: {}, order: 'title ASC'})
    .then(function(migrations) {
      var pos = -1

      if (!migrations) {
        return fn(null, {pos: pos})
      }

      for (var n = 0; n < migrations.length; ++n) {
        if (migrations[n] && migrations[n].current === true) {
          pos = n
        }
      }

      fn(null, {pos: pos})
    }, function() {
      db.sequelize.query(
        'CREATE TABLE IF NOT EXISTS migrations (' +
        '  id bigint(11) unsigned NOT NULL AUTO_INCREMENT,' +
        '  title varchar(255) NOT NULL DEFAULT "",' +
        '  current tinyint(1) NOT NULL DEFAULT 0,' +
        '  createdAt datetime DEFAULT CURRENT_TIMESTAMP,' +
        '  updatedAt datetime DEFAULT NULL,' +
        '  PRIMARY KEY (id),' +
        '  UNIQUE KEY titleUnique (title)' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8;'
      , null
      , {raw: true}
      ).done(function(err) {
        if (err) {
          return fn(err)
        }

        fn(null, {pos: -1})
      })
    })
}

/**
 * Run down migrations and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

List.prototype.down = function(fn, migrationName) {
  this.migrate('down', fn, migrationName)
}

/**
 * Run up migrations and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

List.prototype.up = function(fn, migrationName) {
  this.migrate('up', fn, migrationName)
}

/**
 * Migrate in the given `direction`, calling `fn(err)`.
 *
 * @param {String} direction
 * @param {Function} fn
 * @api public
 */

List.prototype.migrate = function(direction, fn, migrationName) {
  var self = this
  fn = fn || function() {}
  this.load(function(err, obj) {
    if (err) {
      throw new Error('Error loading migrations')
    }

    self.pos = obj.pos
    self.prepare(direction, fn, migrationName)
  })
}

/**
 * Get index of given migration in list of migrations
 *
 * @api private
 */

 function positionOfMigration(migrations, filename) {
   for (var i = 0; i < migrations.length; ++i) {
     if (migrations[i].title === filename) {
       return i
     }
   }
   return 0
 }

/**
 * Perform migration.
 *
 * @api private
 */

List.prototype.prepare = function(direction, fn, migrationName) {
  var self = this
    , migration
    , migrations
    , total = this.migrations.length
    , index = positionOfMigration(this.migrations, migrationName)

  switch (direction) {
    case 'up':
      migrations = this.migrations.slice(this.pos + 1, total - index)
      this.pos = index
      break
    case 'down':
      migrations = this.migrations.slice(this.pos - 1, this.pos).reverse()
      this.pos = index
      break
  }

  function next(migration) {
    if (!migration) {
      self.save(null, fn)
      return false
    }

    var pos = positionOfMigration(self.migrations, migration.title) - 1

    if (pos >= self.pos) {
      return self.save(pos, function() {
        self.emit('migration', migration, direction)
        self.run(migrations, migration, direction, next)
      })
    }

    self.emit('migration', migration, direction)
    self.run(migrations, migration, direction, next)
  }

  migration = migrations.shift()

  next(migration)
}

List.prototype.run = function(migrations, migration, direction, next) {
  migration.before(function() {
    migration[direction](function(err) {
      // error from previous migration
      if (err) {
        throw new Error(err)
      }

      migration.after(function() {
        next(migrations.shift())
      })
    })
  })
}
