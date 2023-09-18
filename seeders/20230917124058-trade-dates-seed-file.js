'use strict'

const date = new Date('2021-01-01T00:00:00.000-08:00')
const DATE_DATA = [
  {
    calendarDate: '2021/1/1',
    tradedayCnt: 0,
    isTrade: false,
    holidayType: 'B',
    description: '中華民國開國紀念日'
  }
]
const HOLIDAY_DATA = require('../data/holidays.json').data
// 引入helpers
const { newDate } = require('../helpers/date-helpers')
// 預設建立2021-01-01以後的1080日(NDAYS)
const NDAYS = 1080

for (let i = 0; i < NDAYS; i++) {
  const nextDay = new Date(date.setDate(date.getDate() + 1))
  const nextDate = newDate(nextDay)
  const holiday = HOLIDAY_DATA.filter(dates => dates.calendarDate === nextDate)
  const dateObj = {
    calendarDate: nextDay,
    tradedayCnt: 0
  }

  if (holiday.length) {
    // Case 1: 若該日為國定假日時
    dateObj.isTrade = false
    dateObj.holidayType = 'B'
    dateObj.description = holiday[0].description
  } else if ((nextDay.getDay() === 0) || (nextDay.getDay() === 6)) {
    // Case 2: 若該日為週六或週日時
    dateObj.isTrade = false
    dateObj.holidayType = 'A'
    dateObj.description = '周休二日'
  } else {
    // Case 3: 其餘皆為交易日
    dateObj.isTrade = true
    dateObj.holidayType = ''
    dateObj.description = ''
  }

  DATE_DATA.push(dateObj)
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Trade_Dates',
      DATE_DATA.map(item => {
        return {
          calendar_date: item.calendarDate,
          tradeday_cnt: item.tradedayCnt,
          is_trade: item.isTrade,
          holiday_type: item.holidayType,
          description: item.description,
          created_at: new Date(),
          updated_at: new Date()
        }
      }), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Trade_Dates', {})
  }
}
