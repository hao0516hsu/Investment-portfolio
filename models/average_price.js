'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class AveragePrice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      AveragePrice.belongsTo(models.Stock, { foreignKey: 'stockId' })
      AveragePrice.belongsTo(models.Period, { foreignKey: 'periodId' })
    }
  };
  AveragePrice.init({
    tradeDate: {
      type: DataTypes.DATEONLY,
      primaryKey: true
    },
    stockId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    periodId: DataTypes.INTEGER,
    avgClose: DataTypes.DECIMAL,
    avgVol: DataTypes.BIGINT,
    avgAmt: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'AveragePrice',
    tableName: 'Average_prices',
    underscored: true
  })
  return AveragePrice
}
