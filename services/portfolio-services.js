const { newDate } = require('../helpers/date-helpers')
const { StockGroup, Stock, Price, AveragePriceAcross, Sequelize } = require('../models')
const { Op } = require('sequelize')

const portfolioServices = {
  // 個別證券的頁面
  getStock: (req, cb) => {
    const date = new Date()
    const previousDay = new Date(new Date().setDate(date.getDate() - 10))
    const tradeCode = req.params.id
    const startDate = newDate(previousDay)
    const endDate = newDate(date)

    Promise.all([
      AveragePriceAcross.findAll({
        attributes: ['tradeDate', 'D5Close', 'D5Vol', 'D5Amt', 'D20Close', 'D20Vol', 'D20Amt', 'D60Close', 'D60Vol', 'D60Amt', 'D120Close', 'D120Vol', 'D120Amt'],
        include: [{ model: Stock, where: { tradeCode }, attributes: [] }],
        nest: true,
        raw: true,
        where: {
          tradeDate: {
            [Op.and]: {
              [Op.gte]: startDate,
              [Op.lte]: endDate
            }
          }
        }
      }),
      Price.findAll({
        include: [
          {
            model: Stock,
            where: { tradeCode },
            include: [{ model: StockGroup }]
          }
        ],
        nest: true,
        raw: true,
        where: {
          tradeDate: {
            [Op.and]: {
              [Op.gte]: startDate,
              [Op.lte]: endDate
            }
          }
        }
      })
    ])
      .then(([avgPrices, prices]) => {
        const stockCode = {
          stockCode: prices[0].Stock.tradeCode,
          stockName: prices[0].Stock.name,
          Industry: prices[0].Stock.StockGroup.groupName
        }
        const stockPrices = prices.map(price => ({
          tradeDate: price.tradeDate,
          openPrc: price.openPrc,
          highPrc: price.highPrc,
          lowPrc: price.lowPrc,
          closePrc: price.closePrc,
          tradeCnt: price.tradeCnt,
          tradeVol: price.tradeVol,
          tradeAmt: price.tradeAmt,
          diffPrc: price.diffPrc
        }))
        return cb(null, {
          stockCode,
          stockPrices,
          averagePrices: avgPrices
        })
      })
  },
  // 前台首頁
  getStocks: (req, cb) => {
    // 先查詢最新資料日
    Price.findAll({
      attributes: ['tradeDate'],
      order: [['tradeDate', 'DESC']],
      limit: 1,
      raw: true
    })
    // 查詢: 前十大漲幅和前十大跌幅
      .then(tradeDate => {
        return Promise.all([
          Price.findAll({
            attributes: ['tradeDate',
              [Sequelize.literal('ROUND((`Price`.`diff_prc` / (`Price`.`close_prc`-`Price`.`diff_prc`) * 100),2 )'), 'diffPct']
            ],
            include: { model: Stock, attributes: ['tradeCode', 'name'] },
            where: {
              closePrc: { [Op.ne]: null },
              tradeDate: tradeDate[0].tradeDate
            },
            order: [[Sequelize.literal('(`Price`.`diff_prc` / (`Price`.`close_prc`-`Price`.`diff_prc`) )'), 'DESC']],
            limit: 10,
            raw: true,
            nest: true
          }),
          Price.findAll({
            attributes: ['tradeDate',
              [Sequelize.literal('ROUND((`Price`.`diff_prc` / (`Price`.`close_prc`-`Price`.`diff_prc`) * 100),2 )'), 'diffPct']
            ],
            include: { model: Stock, attributes: ['tradeCode', 'name'] },
            where: {
              closePrc: { [Op.ne]: null },
              tradeDate: tradeDate[0].tradeDate
            },
            order: [[Sequelize.literal('(`Price`.`diff_prc` / (`Price`.`close_prc`-`Price`.`diff_prc`) )'), 'ASC']],
            limit: 10,
            raw: true,
            nest: true
          })
        ])
      })
    // 傳到JSON
      .then(([surge, plummet]) => {
        return cb(null, {
          surge,
          plummet
        })
      })
  },
  // 證券清單
  getStockLists: (req, cb) => {
    Stock.findAll({
      attributes: ['tradeCode', 'name'],
      where: {
        isListed: 1
      },
      raw: true,
      limit: 10
    })
      .then(stocks => {
        return cb(null, {
          stocks
        })
      })
  }
}
module.exports = portfolioServices
