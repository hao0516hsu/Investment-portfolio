'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class RawStock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      RawStock.belongsTo(models.StockGroup, { foreignKey: 'groupId' })
    }
  };
  RawStock.init({
    tradeCode: DataTypes.STRING,
    name: DataTypes.STRING,
    beginDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'RawStock',
    tableName: 'Raw_stocks',
    underscored: true
  })
  return RawStock
}
