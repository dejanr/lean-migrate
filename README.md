# migrate

migrate is a simple tool for migrating mysql schema.

[![Build Status]()]()

## Installation

    $ npm install lean-migrate

## Usage

lean-migrate is using dotenv, so by installing lean-migrate all you have to do is create dotenv
file and you could create task inside your package.json for running migrations. to customize LOGLEVEL
just pass different verbosity level. All migrate operations would use dotenv file for database connection.

```
  {
    "name": "project-x",
    "scripts": {
      "migrate": "LOGLEVEL=silly NODE_ENV=test migrate && LOGLEVEL=silly NODE_ENV=development migrate",
      ...
```

Additionally you could specify different envirionments for development, staging, test, and production.

```
Usage: migrate [options] [command]

Options:

   -c, --chdir <path>   change the working directory

Commands:

   down             migrate down
   up               migrate up (the default command)
   create [title]   create a new migration file with optional [title]

```

## Creating Migrations

To create a migration, execute `migrate create` with an optional title. `migrate` will create a node module within `./migrations/` which contains the following two exports:

    exports.up = function(next){
      next();
    };

    exports.down = function(next){
      next();
    };

All you have to do is populate these, invoking `next()` when complete, and you are ready to migrate!

For example:

    $ migrate create add-pets
    $ migrate create add-owners

The first call creates `./migrations/{timestamp in milliseconds}-add-column.js`, which we can populate:

      exports.up = function(next) {
        next()
      }

      exports.down = function(next) {
        next()
      }

## Running Migrations

When first running the migrations, all will be executed in sequence.

    $ migrate
    up : migrations/1316027432511-add-column.js
    migration : complete

Subsequent attempts will simply output "complete", as they have already been executed in this machine. `node-migrate` knows this because it stores the current state in `./migrations/.migrate` which is typically a file that SCMs like GIT should ignore.

    $ migrate
    migration : complete

If we were to create another migration using `migrate create`, and then execute migrations again, we would execute only those not previously executed:

    $ migrate
    up : migrates/1316027433455-remove-column.js

You can also run migrations incrementally by specifying a migration.

    $ migrate up 1316027433455-remove-column.js
    up : migrations/1316027432511-add-column.js
    up : migrations/1316027433455-remove-column.js
    migration : complete

This will run up-migrations upto (and including) `1316027433425-coolest-pet.js`. Similarly you can run down-migrations upto (and including) a specific migration, instead of migrating all the way down.

    $ migrate down 1316027432512-add-jane.js
    down : migrations/1316027432575-add-owners.js
    down : migrations/1316027432512-add-jane.js
    migration : complete

## Before and after hooks

If we need to do something before or cleanup after migration, we could use
before and after hooks to hook into migration execution flow.

```
  exports.before = function(done) {
    ...
  }
  exports.up = function(next) {
    ...
  }
  exports.down = function(next) {
    ...
  }
  exports.after = function(done) {
    ...
  }
```

## TODO

- Run specific migration (up/down)
- Fix down, its currently broken
