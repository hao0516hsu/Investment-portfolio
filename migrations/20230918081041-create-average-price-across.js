'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Average_prices_across', {
      trade_date: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DATEONLY
      },
      stock_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      D5_close: {
        type: Sequelize.DECIMAL(9, 3)
      },
      D5_vol: {
        type: Sequelize.BIGINT
      },
      D5_amt: {
        type: Sequelize.BIGINT
      },
      D20_close: {
        type: Sequelize.DECIMAL(9, 3)
      },
      D20_vol: {
        type: Sequelize.BIGINT
      },
      D20_amt: {
        type: Sequelize.BIGINT
      },
      D60_close: {
        type: Sequelize.DECIMAL(9, 3)
      },
      D60_vol: {
        type: Sequelize.BIGINT
      },
      D60_amt: {
        type: Sequelize.BIGINT
      },
      D120_close: {
        type: Sequelize.DECIMAL(9, 3)
      },
      D120_vol: {
        type: Sequelize.BIGINT
      },
      D120_amt: {
        type: Sequelize.BIGINT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Average_prices_across')
  }
}
