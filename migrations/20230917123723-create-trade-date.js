'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Trade_dates', {
      calendar_date: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DATEONLY
      },
      tradeday_cnt: {
        type: Sequelize.SMALLINT
      },
      is_trade: {
        type: Sequelize.BOOLEAN
      },
      holiday_type: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Trade_dates')
  }
}
