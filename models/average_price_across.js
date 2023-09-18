'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class AveragePriceAcross extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      AveragePriceAcross.belongsTo(models.Stock, { foreignKey: 'stockId' })
    }
  };
  AveragePriceAcross.init({
    tradeDate: {
      type: DataTypes.DATEONLY,
      primaryKey: true
    },
    stockId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    D5Close: DataTypes.DECIMAL,
    D5Vol: DataTypes.BIGINT,
    D5Amt: DataTypes.BIGINT,
    D20Close: DataTypes.DECIMAL,
    D20Vol: DataTypes.BIGINT,
    D20Amt: DataTypes.BIGINT,
    D60Close: DataTypes.DECIMAL,
    D60Vol: DataTypes.BIGINT,
    D60Amt: DataTypes.BIGINT,
    D120Close: DataTypes.DECIMAL,
    D120Vol: DataTypes.BIGINT,
    D120Amt: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'AveragePriceAcross',
    tableName: 'Average_prices_across',
    underscored: true
  })
  return AveragePriceAcross
}
