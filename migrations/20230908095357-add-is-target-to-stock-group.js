'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Stock_Groups', 'is_target', {
      type: Sequelize.BOOLEAN,
      defaultValue: 1
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Stock_groups', 'is_target')
  }
}
