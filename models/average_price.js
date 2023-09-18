'use strict'
const {
  Model, Op
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
      // Self join: D20
      AveragePrice.hasOne(models.AveragePrice, {
        foreignKey: 'stockId',
        sourceKey: 'stockId',
        scope: [
          { [Op.and]: sequelize.where(sequelize.col('AveragePrice.trade_date'), Op.eq, sequelize.col('D20.trade_date')) },
          { [Op.and]: sequelize.where(sequelize.col('D20.period_id'), Op.eq, 12) }
        ],
        as: 'D20',
        constraints: false
      })
      // Self join: D60
      AveragePrice.hasOne(models.AveragePrice, {
        foreignKey: 'stockId',
        sourceKey: 'stockId',
        scope: [
          { [Op.and]: sequelize.where(sequelize.col('AveragePrice.trade_date'), Op.eq, sequelize.col('D60.trade_date')) },
          { [Op.and]: sequelize.where(sequelize.col('D60.period_id'), Op.eq, 13) }
        ],
        as: 'D60',
        constraints: false
      })
      // Self join: D120
      AveragePrice.hasOne(models.AveragePrice, {
        foreignKey: 'stockId',
        sourceKey: 'stockId',
        scope: [
          { [Op.and]: sequelize.where(sequelize.col('AveragePrice.trade_date'), Op.eq, sequelize.col('D120.trade_date')) },
          { [Op.and]: sequelize.where(sequelize.col('D120.period_id'), Op.eq, 14) }
        ],
        as: 'D120',
        constraints: false
      })
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
