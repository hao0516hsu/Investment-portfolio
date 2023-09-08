'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class StockGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      StockGroup.belongsTo(models.Exchange, { foreignKey: 'exchangeId' })
    }
  };
  StockGroup.init({
    groupName: DataTypes.STRING,
    groupCode: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'StockGroup',
    tableName: 'Stock_Groups',
    underscored: true
  })
  return StockGroup
}
