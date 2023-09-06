'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Exchange extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  Exchange.init({
    abbrev: DataTypes.STRING,
    nameChn: DataTypes.STRING,
    nameEng: DataTypes.STRING,
    nameJpn: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Exchange',
    tableName: 'Exchanges',
    underscored: true
  })
  return Exchange
}
