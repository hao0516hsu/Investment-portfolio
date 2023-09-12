'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Raw_prices', {
      trade_date: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DATEONLY
      },
      trade_code: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
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
      stock_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Stocks',
          key: 'id'
        }
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
    await queryInterface.dropTable('Raw_prices')
  }
}
