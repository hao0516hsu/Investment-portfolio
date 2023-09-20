'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Portfolio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Portfolio.belongsTo(models.Stock, { foreignKey: 'stockId' })
    }
  };
  Portfolio.init({
    buyDate: DataTypes.DATEONLY,
    buyPrice: DataTypes.DECIMAL,
    buyVol: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Portfolio',
    tableName: 'Portfolios',
    underscored: true
  })
  return Portfolio
}
