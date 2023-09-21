'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class HolidayType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      HolidayType.hasMany(models.TradeDate, { foreignKey: 'holidayType' })
    }
  };
  HolidayType.init({
    holidayType: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'HolidayType',
    tableName: 'Holiday_types',
    underscored: true
  })
  return HolidayType
}
