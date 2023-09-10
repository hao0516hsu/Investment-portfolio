'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Stocks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      trade_code: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      is_listed: {
        type: Sequelize.BOOLEAN
      },
      group_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Stock_Groups',
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
    await queryInterface.dropTable('Stocks')
  }
}
