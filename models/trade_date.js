'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class TradeDate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      TradeDate.hasMany(models.Price, { foreignKey: 'tradeDate' })
      TradeDate.belongsTo(models.HolidayType, { foreignKey: 'holidayType' })
    }
  };
  TradeDate.init({
    calendarDate: {
      type: DataTypes.DATEONLY,
      primaryKey: true
    },
    tradedayCnt: DataTypes.SMALLINT,
    isTrade: DataTypes.BOOLEAN,
    holidayType: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'TradeDate',
    tableName: 'Trade_dates',
    underscored: true
  })
  return TradeDate
}
