'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class RawPrice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      RawPrice.belongsTo(models.Stock, { foreignKey: 'stockId' })
    }
  };
  RawPrice.init({
    tradeDate: {
      type: DataTypes.DATEONLY,
      primaryKey: true
    },
    tradeCode: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    openPrc: DataTypes.DECIMAL,
    highPrc: DataTypes.DECIMAL,
    lowPrc: DataTypes.DECIMAL,
    closePrc: DataTypes.DECIMAL,
    tradeCnt: DataTypes.INTEGER,
    tradeVol: DataTypes.BIGINT,
    tradeAmt: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'RawPrice',
    tableName: 'Raw_prices',
    underscored: true
  })
  return RawPrice
}
