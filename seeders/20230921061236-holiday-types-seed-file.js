'use strict'

const HOLIDAY_TYPES_DATA = [
  { holidayType: 'A', name: '周休二日' },
  { holidayType: 'B', name: '國定假日' },
  { holidayType: 'C', name: '颱風假' }
]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Holiday_types',
      HOLIDAY_TYPES_DATA.map(item => {
        return {
          holiday_type: item.holidayType,
          name: item.name,
          created_at: new Date(),
          updated_at: new Date()
        }
      }), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Holiday_types', {})
  }
}
