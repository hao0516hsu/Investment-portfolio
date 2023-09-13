'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Prices', {
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
      open_prc: {
        type: Sequelize.DECIMAL(9, 3)
      },
      high_prc: {
        type: Sequelize.DECIMAL(9, 3)
      },
      low_prc: {
        type: Sequelize.DECIMAL(9, 3)
      },
      close_prc: {
        type: Sequelize.DECIMAL(9, 3)
      },
      trade_cnt: {
        type: Sequelize.INTEGER
      },
      trade_vol: {
        type: Sequelize.BIGINT
      },
      trade_amt: {
        type: Sequelize.BIGINT
      },
      diff_prc: {
        type: Sequelize.DECIMAL(9, 3)
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
    await queryInterface.dropTable('Prices')
  }
}
