'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Period extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Period.hasMany(models.AveragePrice, { foreignKey: 'periodId' })
    }
  };
  Period.init({
    periodCode: DataTypes.STRING,
    description: DataTypes.TEXT,
    periodParams: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Period',
    tableName: 'Periods',
    underscored: true
  })
  return Period
}
