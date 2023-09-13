'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Price extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  Price.init({
    tradeDate: {
      type: DataTypes.DATEONLY,
      primaryKey: true
    },
    stockId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    openPrc: DataTypes.DECIMAL,
    highPrc: DataTypes.DECIMAL,
    lowPrc: DataTypes.DECIMAL,
    closePrc: DataTypes.DECIMAL,
    tradeCnt: DataTypes.INTEGER,
    tradeVol: DataTypes.BIGINT,
    tradeAmt: DataTypes.BIGINT,
    diffPrc: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Price',
    tableName: 'Prices',
    underscored: true
  })
  return Price
}
