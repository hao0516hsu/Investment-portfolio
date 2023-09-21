'use strict'

const EXCHANGES_DATA = [
  { abbrev: 'TWSE', nameChn: '台灣證券交易所', nameEng: 'Taiwan Stock Exchange Corporation', nameJpn: '台湾証券取引所' },
  { abbrev: 'OTC', nameChn: '證券櫃檯買賣中心', nameEng: 'Taipei Exchange', nameJpn: 'タイペイエクスチェンジ' }
]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Exchanges',
      EXCHANGES_DATA.map(item => {
        return {
          abbrev: item.abbrev,
          name_chn: item.nameChn,
          name_eng: item.nameEng,
          name_jpn: item.nameJpn,
          created_at: new Date(),
          updated_at: new Date()
        }
      }), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Exchanges', {})
  }
}
