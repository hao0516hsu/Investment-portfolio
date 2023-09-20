'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Portfolios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      buy_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      buy_price: {
        allowNull: false,
        type: Sequelize.DECIMAL(9, 3)
      },
      buy_vol: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
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
    await queryInterface.dropTable('Portfolios')
  }
}
