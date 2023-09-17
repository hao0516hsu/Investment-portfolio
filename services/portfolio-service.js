const { StockGroup, Stock, Price } = require('../models')
const { Op } = require('sequelize')

const portfolioService = {
  getStock: (req, cb) => {
    const tradeCode = req.params.id
    const startDate = '2023/8/16'
    const endDate = '2023/9/15'

    Price.findAll({
      include: [
        {
          model: Stock,
          where: { tradeCode },
          include: [StockGroup]
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
      .then(prices => {
        console.log(prices)

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
          diffPrc: price.diffPrc,
          ma5: '550',
          ma20: '550',
          ma60: '550',
          ma120: '550',
          ma240: '550'
        }))
        return cb(null, {
          stockCode,
          stockPrices
        })
      })
  }
}
module.exports = portfolioService
