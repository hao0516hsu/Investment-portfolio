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
  postExchange: (req, cb) => {
    const { abbrev, nameChn, nameEng, nameJpn } = req.body

    if (!abbrev || !nameChn) throw new Error('不得為空白！')
    if (abbrev.includes(';') || abbrev.includes('--') || nameChn.includes(';') || nameChn.includes('--') || nameEng.includes(';') || nameEng.includes('--') || nameJpn.includes(';') || nameJpn.includes('--')) throw new Error('出現無效字元！')
    if (abbrev.length > 10) throw new Error('不得超過10個字元！')
    if (nameChn.length > 30) throw new Error('不得超過30個字元！')
    if (nameEng.length > 70 || nameJpn.length > 70) throw new Error('不得超過70個字元！')

    return Exchange.create({ abbrev, nameChn, nameEng, nameJpn })
      .then(createExchange => {
        return cb(null, { exchange: createExchange })
      })
      .catch(err => cb(err))
  },
  putExchange: (req, cb) => {
    const id = req.params.id
    const { abbrev, nameChn, nameEng, nameJpn } = req.body

    if (!abbrev || !nameChn) throw new Error('不得為空白！')
    if (abbrev.includes(';') || abbrev.includes('--') || nameChn.includes(';') || nameChn.includes('--') || nameEng.includes(';') || nameEng.includes('--') || nameJpn.includes(';') || nameJpn.includes('--')) throw new Error('出現無效字元！')
    if (abbrev.length > 10) throw new Error('不得超過10個字元！')
    if (nameChn.length > 30) throw new Error('不得超過30個字元！')
    if (nameEng.length > 70 || nameJpn.length > 70) throw new Error('不得超過100個字元！')

    return Exchange.findOne({
      where: { id },
      raw: true
    })
      .then(exchange => {
        if (!exchange) {
          const err = new Error('查無資料！')
          err.status = 404
          throw err
        }
        if (abbrev === exchange.abbrev && nameChn === exchange.nameChn && nameEng === exchange.nameEng && nameJpn === exchange.nameJpn) throw new Error('沒有修改資料！')

        Exchange.update({ abbrev, nameChn, nameEng, nameJpn }, { where: { id } })
        return { id, abbrev, nameChn, nameEng, nameJpn }
      })
      .then(putExchange => cb(null, { exchange: putExchange }))
      .catch(err => cb(err))
  },
  deleteExchange: (req, cb) => {
    const id = req.params.id
    Exchange.findOne({
      where: { id },
      raw: true
    })
      .then(exchange => {
        if (!exchange) {
          const err = new Error('查無資料！')
          err.status = 404
          throw err
        }
        Exchange.destroy({ where: { id } })
        return exchange
      })
      .then(deletedExchange => {
        return cb(null, { exchange: deletedExchange })
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
  postStockGroup: (req, cb) => {
    const { groupName, groupCode, exchangeId, isTarget } = req.body

    if (!groupName || !exchangeId) throw new Error('不得為空白！')
    if (!Number.isInteger(exchangeId)) throw new Error('不得輸入數值以外的字元！')
    if (!(isTarget === 0 || isTarget === 1)) throw new Error('只能輸入是或否！')
    if (groupName.includes(';') || groupName.includes('--') || groupCode.includes(';') || groupCode.includes('--')) throw new Error('出現無效字元！')
    if (groupName.length > 20) throw new Error('不得超過20個字元！')
    if (groupCode.length > 50) throw new Error('不得超過50個字元！')

    return StockGroup.create({ groupName, groupCode, exchangeId, isTarget })
      .then(createStockGroup => {
        return cb(null, { stockgroup: createStockGroup })
      })
      .catch(err => cb(err))
  },
  patchStockGroup: (req, cb) => {
    const id = req.params.id
    const { groupName, groupCode, exchangeId, isTarget } = req.body

    if (!groupName || !exchangeId) throw new Error('不得為空白！')
    if (!Number.isInteger(exchangeId)) throw new Error('不得輸入數值以外的字元！')
    if (!(isTarget === 0 || isTarget === 1)) throw new Error('只能輸入是或否！')
    if (groupName.includes(';') || groupName.includes('--') || groupCode.includes(';') || groupCode.includes('--')) throw new Error('出現無效字元！')
    if (groupName.length > 20) throw new Error('不得超過20個字元！')
    if (groupCode.length > 50) throw new Error('不得超過50個字元！')

    return StockGroup.findOne({
      where: { id },
      raw: true
    })
      .then(stockgroup => {
        if (!stockgroup) {
          const err = new Error('查無資料！')
          err.status = 404
          throw err
        }
        const patchStockGroup = { groupName, groupCode, exchangeId, isTarget }

        if (groupName === stockgroup.groupName) delete patchStockGroup.groupName
        if (groupCode === stockgroup.groupCode) delete patchStockGroup.groupCode
        if (exchangeId === Number(stockgroup.exchangeId)) delete patchStockGroup.exchangeId
        if (isTarget === stockgroup.isTarget) delete patchStockGroup.isTarget
        if (!Object.keys(patchStockGroup).length) throw new Error('沒有修改資料！')

        return StockGroup.update(patchStockGroup, { where: { id } })
      })
      .then(() => {
        return cb(null, { stockgroup: { id, groupName, groupCode, exchangeId, isTarget } })
      })
      .catch(err => cb(err))
  },
  deleteStockGroup: (req, cb) => {
    const id = req.params.id

    StockGroup.findOne({
      where: { id },
      raw: true
    })
      .then(stockGroup => {
        if (!stockGroup) {
          const err = new Error('查無資料！')
          err.status = 404
          throw err
        }
        StockGroup.destroy({ where: { id } })
        return stockGroup
      })
      .then(deletedStockGroup => {
        return cb(null, { stockgroup: deletedStockGroup })
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
  postStock: (req, cb) => {
    const { tradeCode, name, isListed, groupId } = req.body

    if (!tradeCode || !name) throw new Error('不得為空白！')
    if (!Number.isInteger(groupId)) throw new Error('不得輸入數值以外的字元！')
    if (!(isListed === 0 || isListed === 1)) throw new Error('只能輸入是或否！')
    if (tradeCode.includes(';') || tradeCode.includes('--') || name.includes(';') || name.includes('--')) throw new Error('出現無效字元！')
    if (tradeCode.length > 7) throw new Error('不得超過7個字元！')
    if (name.length > 20) throw new Error('不得超過20個字元！')

    return Stock.create({ tradeCode, name, isListed, groupId })
      .then(createStock => {
        return cb(null, { stock: createStock })
      })
      .catch(err => cb(err))
  },
  patchStock: (req, cb) => {
    const id = req.params.id
    const { tradeCode, name, isListed, groupId } = req.body

    if (!tradeCode || !name) throw new Error('不得為空白！')
    if (!Number.isInteger(groupId)) throw new Error('不得輸入數值以外的字元！')
    if (!(isListed === 0 || isListed === 1)) throw new Error('只能輸入是或否！')
    if (tradeCode.includes(';') || tradeCode.includes('--') || name.includes(';') || name.includes('--')) throw new Error('出現無效字元！')
    if (tradeCode.length > 7) throw new Error('不得超過7個字元！')
    if (name.length > 20) throw new Error('不得超過20個字元！')

    return Stock.findOne({
      where: { id },
      raw: true
    })
      .then(stock => {
        if (!stock) {
          const err = new Error('查無資料！')
          err.status = 404
          throw err
        }
        const patchStock = { tradeCode, name, isListed, groupId }

        if (tradeCode === stock.tradeCode) delete patchStock.tradeCode
        if (name === stock.name) delete patchStock.name
        if (groupId === Number(stock.groupId)) delete patchStock.groupId
        if (isListed === stock.isListed) delete patchStock.isListed
        if (!Object.keys(patchStock).length) throw new Error('沒有修改資料！')

        return Stock.update(patchStock, { where: { id } })
      })
      .then(() => {
        return cb(null, { stock: { id, tradeCode, name, isListed, groupId } })
      })
      .catch(err => cb(err))
  },
  deleteStock: (req, cb) => {
    const id = req.params.id

    Stock.findOne({
      where: { id },
      raw: true
    })
      .then(stock => {
        if (!stock) {
          const err = new Error('查無資料！')
          err.status = 404
          throw err
        }
        Stock.destroy({ where: { id } })
        return stock
      })
      .then(deletedStock => {
        return cb(null, { stock: deletedStock })
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
