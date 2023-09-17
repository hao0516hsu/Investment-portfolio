'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Stock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Stock.belongsTo(models.StockGroup, { foreignKey: 'groupId' })
      Stock.hasMany(models.RawPrice, { foreignKey: 'stockId' })
      Stock.hasMany(models.Price, { foreignKey: 'stockId' })
      Stock.hasMany(models.AveragePrice, { foreignKey: 'stockId' })
    }
  };
  Stock.init({
    tradeCode: DataTypes.STRING,
    name: DataTypes.STRING,
    isListed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Stock',
    tableName: 'Stocks',
    underscored: true
  })
  return Stock
}
