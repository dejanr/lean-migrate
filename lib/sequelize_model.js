module.exports = function(sequelize, DataTypes) {
  var fields = {
    id: {
      type: DataTypes.BIGINT(11).UNSIGNED
    , autoIncrement: true
    }
  , title: {
      type: DataTypes.STRING
    , allowNull: true
    }
  , current: {
      type: DataTypes.BOOLEAN
    , allowNull: true
    , defaultValue: false
    }
  }

  var Migration = sequelize.define('Migration', fields, {
    tableName: 'migrations'
  , timestamps: true
  })

  return Migration
}
