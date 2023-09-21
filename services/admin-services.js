const { Exchange, StockGroup, Stock, TradeDate, HolidayType, Sequelize } = require('../models')
const { Op } = require('sequelize')
const { newDate } = require('../helpers/date-helpers')
const date = new Date()

const adminServices = {
  // 交易所資料
  getExchanges: (req, cb) => {
    Exchange.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      raw: true
    })
      .then(exchanges => {
        return cb(null, { exchanges })
      })
      .catch(err => cb(err))
  },
  // 股票分類資料
  getStockGroups: (req, cb) => {
    StockGroup.findAll({
      attributes: [
        'id', 'groupName', 'groupCode', 'isTarget', 'exchangeId',
        [Sequelize.col('Exchange.abbrev'), 'abbrev'],
        [Sequelize.col('Exchange.name_chn'), 'nameChn']
      ],
      include: [{ model: Exchange, attributes: [] }],
      order: [['id', 'ASC']],
      nest: true,
      raw: true
    })
      .then(stockGroups => {
        return cb(null, { stockGroups })
      })
      .catch(err => cb(err))
  },
  // 股票資料
  getStocks: (req, cb) => {
    Stock.findAll({
      attributes: [
        'id', 'tradeCode', 'name', 'isListed', 'groupId',
        [Sequelize.col('StockGroup.group_name'), 'groupName']
      ],
      include: [{ model: StockGroup, attributes: [] }],
      raw: true
    })
      .then(stocks => {
        return cb(null, { stocks })
      })
      .catch(err => cb(err))
  },
  // 交易日資料
  getTradeDates: (req, cb) => {
    const previousDay = new Date(new Date().setDate(date.getDate() - 10))
    const startDate = req.query.startDate || newDate(previousDay)
    const endDate = req.query.endDate || newDate(date)
    if (startDate > endDate) throw new Error('查詢起日應小於或等於查詢迄日！')

    TradeDate.findAll({
      attributes: [
        'calendarDate', 'tradedayCnt', 'isTrade', 'holidayType', 'description',
        [Sequelize.col('HolidayType.name'), 'holidayTypeName']
      ],
      include: [{ model: HolidayType, attributes: [] }],
      where: {
        calendarDate: {
          [Op.and]: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        }
      },
      order: [['calendarDate', 'ASC']],
      raw: true
    })
      .then(tradeDates => {
        return cb(null, { tradeDates })
      })
      .catch(err => cb(err))
  }
}

module.exports = adminServices
