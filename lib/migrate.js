var Migration = require('./migrate/migration')
  , List = require('./migrate/list')

exports = module.exports = migrate

function migrate(title, up, down) {
  // register migration
  if (typeof title === 'string' && up && down) {
    migrate.list.migrations.push(new Migration(title, up, down))
  // setup new migrations list
  } else if (typeof title === 'string') {
    migrate.list = new List()
  // no migration path
  } else if (!migrate.list) {
    throw new Error('must invoke migrate(path) before running migrations')
  // run migrations
  } else {
    return migrate.list
  }
}
