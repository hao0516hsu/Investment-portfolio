'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Average_prices', {
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
      period_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      avg_close: {
        type: Sequelize.DECIMAL(9, 3)
      },
      avg_vol: {
        type: Sequelize.BIGINT
      },
      avg_amt: {
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
    await queryInterface.dropTable('Average_prices')
  }
}
