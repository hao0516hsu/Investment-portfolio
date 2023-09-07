'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class RawStockGroups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  RawStockGroups.init({
    name: DataTypes.STRING,
    groupCode: DataTypes.STRING,
    beginDate: DataTypes.DATE,
    endDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'RawStockGroups',
    tableName: 'Raw_stock_groups',
    underscored: true
  })
  return RawStockGroups
}
