'use strict'
const PERIODS_DATA = [
  { periodCode: 'D0005', description: '近5個交易日', periodParams: 5 },
  { periodCode: 'D0020', description: '近20個交易日', periodParams: 20 },
  { periodCode: 'D0060', description: '近60個交易日', periodParams: 60 },
  { periodCode: 'D0120', description: '近120個交易日', periodParams: 120 },
  { periodCode: 'D0240', description: '近240個交易日', periodParams: 240 },
  { periodCode: 'D0720', description: '近720個交易日', periodParams: 720 },
  { periodCode: 'D1200', description: '近1200個交易日', periodParams: 1200 },
  { periodCode: 'D2400', description: '近2400個交易日', periodParams: 2400 },
  { periodCode: 'MP01', description: '近1個月的交易日', periodParams: 1 },
  { periodCode: 'MF01', description: '同1個月的交易日', periodParams: 1 }
]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Periods',
      PERIODS_DATA.map(item => {
        return {
          period_code: item.periodCode,
          description: item.description,
          period_params: item.periodParams,
          created_at: new Date(),
          updated_at: new Date()
        }
      }), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Periods', {})
  }
}
