const { newDate, getYear } = require('../helpers/date-helpers')
const { StockGroup, Stock, Price, AveragePriceAcross, Portfolio, Sequelize } = require('../models')
const { Op } = require('sequelize')
const date = new Date()

const portfolioServices = {
  // 個別證券的頁面
  getStock: (req, cb) => {
    const previousDay = new Date(new Date().setDate(date.getDate() - 10))
    const tradeCode = req.params.id
    const startDate = req.query.startDate || newDate(previousDay)
    const endDate = req.query.endDate || newDate(date)

    if (startDate > endDate) throw new Error('查詢起日應小於或等於查詢迄日！')

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
    const tradeCode = req.query.tradeCode.trim()
    const LIMIT = Number(req.query.limit) || 10

    if (tradeCode.length === 0) throw new Error('不得輸入空白！')
    if (tradeCode.length > 7) throw new Error('不得超過7個字元！')
    if (LIMIT.toString().length > 3) throw new Error('不得超過3個字元！')
    if (tradeCode.includes(';') || tradeCode.includes('--') || tradeCode.includes('drop') || tradeCode.includes('delete')) throw new Error('出現無效字元！')
    if (LIMIT === undefined) throw new Error('查詢筆數錯誤！')

    Stock.findAll({
      attributes: ['tradeCode', 'name'],
      where: {
        isListed: 1,
        tradeCode: { [Op.like]: '%' + tradeCode + '%' }
      },
      raw: true,
      limit: LIMIT
    })
      .then(stocks => {
        return cb(null, {
          stocks
        })
      })
  },
  // 新增損益表
  postPortfolio: (req, cb) => {
    const { tradeCode, buyDate, buyPrice, buyVol } = req.body
    const dateCheck = new Date(buyDate)
    const userId = req.user.toJSON().id

    if (!tradeCode || !buyDate || !buyPrice || !buyVol) throw new Error('不得為空白！')
    if (tradeCode.length >= 7) throw new Error('證券代碼格式錯誤！')
    if ((newDate(dateCheck).toString() === 'Invalid Date') || (getYear(dateCheck).toString().length !== 4)) throw new Error('請輸入日期格式資料！')
    if (newDate(dateCheck) > newDate(date)) throw new Error('不得輸入未來日期！')
    if ((buyPrice <= 0) || (buyVol <= 0)) throw new Error('買入價格不得為0或負數！')
    if (!Number.isInteger(buyVol)) throw new Error('買入單位只能為正整數！')

    Stock.findOne({
      where: { tradeCode },
      raw: true
    })
      .then(stock => {
        return Portfolio.create({
          buyDate,
          buyPrice,
          buyVol,
          userId,
          stockId: stock.id
        })
      })
      .then(newAsset => {
        newAsset = newAsset.toJSON()
        delete newAsset.userId
        console.log(newAsset)
        cb(null, { portfolio: newAsset })
      })
      .catch(err => cb(err))
  },
  // 查看損益表
  getPortfolio: async (req, cb) => {
    const userId = req.user.toJSON().id
    const portfolio = []

    await Portfolio.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('stock_id')), 'stockId']],
      where: { userId },
      raw: true
    })
      .then(stocks => {
        stocks.map(stock => portfolio.push(stock.stockId))
      })
    Promise.all([
      // 查詢持股的最新報價
      Price.findAll({
        attributes: ['tradeDate', 'stockId', 'closePrc'],
        where: {
          stockId: portfolio,
          tradeDate: '20230915'
        },
        include: [{ attributes: ['tradeCode', 'name'], model: Stock }],
        raw: true,
        nest: true
      }),
      // 查詢所有持股
      Portfolio.findAll({
        attributes: ['id', 'stockId', 'buyDate', 'buyPrice', 'buyVol'],
        where: { userId },
        raw: true
      }),
      // 計算各項持股成本
      Portfolio.findAll({
        attributes: [
          [Sequelize.col('Stock.trade_code'), 'tradeCode'],
          [Sequelize.fn('sum', Sequelize.col('buy_vol')), 'volume'],
          [Sequelize.fn('sum', Sequelize.literal('buy_price * buy_vol')), 'cost'],
          [Sequelize.literal('ROUND(SUM(buy_price * buy_vol) / SUM(buy_vol),2)'), 'avgBuyPrice']
        ],
        include: [{ model: Stock, attributes: [] }],
        where: { userId },
        group: [Sequelize.col('Stock.trade_code')],
        order: [[Sequelize.col('Stock.trade_code'), 'ASC']],
        raw: true
      })
    ])
      .then(([prices, assets, cost]) => {
        const portfolio = []
        const assetMarketCap = {}
        let totalCost = 0
        let totalVol = 0
        let totalMarketCap = 0

        assets.map(asset => {
          const price = prices.filter(price => asset.stockId === price.stockId)[0]
          return portfolio.push({
            id: asset.id,
            tradeCode: price.Stock.tradeCode,
            name: price.Stock.name,
            buyDate: asset.buyDate,
            buyPrice: Number(asset.buyPrice),
            buyVol: Number(asset.buyVol),
            lastTradeDate: price.tradeDate,
            closePrc: Number(price.closePrc),
            profit: Math.floor((price.closePrc - asset.buyPrice) * 100) / 100
          })
        })

        portfolio.forEach(asset => {
          if (!assetMarketCap[asset.tradeCode]) {
            assetMarketCap[asset.tradeCode] = Number(asset.closePrc) * asset.buyVol
          } else {
            assetMarketCap[asset.tradeCode] += Number(asset.closePrc) * asset.buyVol
          }
        })

        cost.forEach(item => {
          item.volume = Number(item.volume)
          item.cost = Number(item.cost)
          item.avgBuyPrice = Number(item.avgBuyPrice)
          totalCost += item.cost
          totalVol += item.volume
          totalMarketCap += assetMarketCap[item.tradeCode]
          item.assetMarketCap = assetMarketCap[item.tradeCode]
        })

        return cb(null, {
          portfolio,
          cost,
          totalCost: {
            totalVol,
            totalCost,
            totalMarketCap
          }
        })
      })
      .catch(err => cb(err))
  },
  // 修改損益表內容
  patchPortfolio: (req, cb) => {
    const id = req.params.id
    const { buyDate, buyPrice, buyVol } = req.body
    const dateCheck = new Date(buyDate)
    const userId = req.user.toJSON().id

    if (!buyDate || !buyPrice || !buyVol) throw new Error('不得為空白！')
    if ((newDate(dateCheck).toString() === 'Invalid Date') || (getYear(dateCheck).toString().length !== 4)) throw new Error('請輸入日期格式資料！')
    if (newDate(dateCheck) > newDate(date)) throw new Error('不得輸入未來日期！')
    if ((buyPrice <= 0) || (buyVol <= 0)) throw new Error('買入價格不得為0或負數！')
    if (!Number.isInteger(buyVol)) throw new Error('買入單位只能為正整數！')

    Portfolio.findOne({
      attributes: ['id', 'buyDate', 'buyPrice', 'buyVol'],
      include: [{
        attributes: [],
        model: Stock
      }],
      where: { userId, id }
    })
      .then(asset => {
        if (!asset) {
          const err = new Error('查無資料！')
          err.status = 404
          throw err
        }
        const assetInfo = asset.toJSON()
        const patchAsset = { buyDate, buyPrice, buyVol }

        if (newDate(dateCheck) === assetInfo.buyDate) delete patchAsset.buyDate
        if (buyPrice === Number(assetInfo.buyPrice)) delete patchAsset.buyPrice
        if (buyVol === Number(assetInfo.buyVol)) delete patchAsset.buyVol
        if (!Object.keys(patchAsset).length) throw new Error('沒有修改資料！')

        return Portfolio.update(patchAsset, { where: { id: assetInfo.id } })
      })
      .then(() => {
        const patchAsset = {
          id,
          buyDate: newDate(dateCheck),
          buyPrice,
          buyVol
        }
        return cb(null, { portfolio: patchAsset })
      })
      .catch(err => cb(err))
  },
  // 刪除損益表內容
  deletePortfolio: (req, cb) => {
    const id = req.params.id
    const userId = req.user.toJSON().id
    Portfolio.findOne({
      where: { id, userId },
      raw: true
    })
      .then(asset => {
        if (!asset) {
          const err = new Error('查無資料！')
          err.status = 404
          throw err
        }
        Portfolio.destroy({ where: { id } })
        delete asset.userId
        return asset
      })
      .then(deletedAsset => {
        return cb(null, { portfolio: deletedAsset })
      })
      .catch(err => cb(err))
  }
}
module.exports = portfolioServices
