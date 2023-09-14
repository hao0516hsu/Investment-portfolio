// Helpers
const { dateConverter, stringToNumber, priceConverter, diffPrcConverter } = require('../helpers/database-helpers')
// Models
const { sequelize, Exchange, RawStockGroup, StockGroup, RawStock, Stock, RawPrice, Price } = require('../models')
// Packages
const { Op } = require('sequelize')
// puppeteer: 模擬抓資料的套件
const puppeteer = require('puppeteer')
// chromium: 模擬Chrome的套件
const chromium = require('chromium')
// axios: 抓API
const axios = require('axios')
// date
const date = new Date()

const currentDay = String(date.getDate()).padStart(2, '0')
const currentMonth = String(date.getMonth() + 1).padStart(2, '0')
const currentYear = date.getFullYear()
const currentDate = `${currentYear}-${currentMonth}-${currentDay}`
const currentDateForAPI = `${currentYear}${currentMonth}${currentDay}`

const databaseServices = {
  // 從證交所抓股票分類資料
  rawStockGroups: () => {
    const TARGET_URL = 'https://www.twse.com.tw/zh/listed/profile/company.html'
    const TARGET_MODAL = '.stock-code-browse'

    // 以下操作都是匿名函式
    return (async () => {
      // 啟動模擬瀏覽器
      const browser = await puppeteer.launch({
        executablePath: chromium.path
      })
      // 開啟新分頁
      const page = await browser.newPage()
      // 連線到目標網址
      await page.goto(TARGET_URL)
      // 點擊目標MODAL
      await page.click(TARGET_MODAL, elements => elements)
      // 選取MODAL的DOM
      const stockCodePanel = await page.waitForSelector('.panel.active')
      // 依序擷取各項BUTTON的資料
      const panelButtons = await stockCodePanel.$$eval('button', button => {
        return button.map(e => {
          return {
            groupName: e.innerHTML,
            groupCode: e.dataset.sub
          }
        })
      })
      // 關閉模擬瀏覽器
      await browser.close()
      // 回傳值
      return await panelButtons
    })()
  },
  // 匯入資料到Raw_stock_groups或是從Raw_stock_groups刪除資料
  createRawStockGroups: data => {
    // 新增段
    // 逐筆搜尋資料庫是否有該筆資料
    Promise.all(data.map(async item => {
      return await RawStockGroup.findOne({
        where: {
          group_name: item.groupName,
          begin_date: { [Op.lte]: date },
          end_date: { [Op.gt]: date }
        },
        raw: true
      })
        .then(stockGroups => {
          // 若有,表示不必更新
          if (stockGroups) return `Data ${item.groupName} kept unchanged.`
          // 若無, 表示需要新增
          return RawStockGroup.create({
            groupName: item.groupName,
            groupCode: item.groupCode,
            beginDate: date,
            endDate: '2999-12-31'
          })
        })
    }))
      .then(msg => console.log(msg))
      .catch(err => console.error(err))
    // 剔除段
    // 找尋現存的所有資料
    RawStockGroup.findAll({
      where: {
        begin_date: { [Op.lte]: date },
        end_date: { [Op.gt]: date }
      }
    })
      .then(items => {
        Promise.all(items.map(item => {
          // 若DB資料且抓檔也有資料,不處理
          if (data.some(x => x.groupName === item.toJSON().groupName)) return `Data ${item.groupName} kept unchanged.`
          // 若DB有資料且抓檔沒有資料,更新結束日
          return item.update({
            endDate: new Date()
          })
        }))
          .then(msg => console.log(msg))
          .catch(err => console.error(err))
      })
  },
  // Raw_stock_groups衍生到 Stock_groups
  deriveToStockGroup: () => {
    const addDataSubquery = 'select group_name from stock_groups'
    const removeDataSubquery = `select id from raw_stock_groups where begin_date <= "${currentDate}" and end_date > "${currentDate}"`
    // 新增資料到Stock_group
    Promise.all([
      // 找Exchange的交易所id
      Exchange.findAll({
        attributes: ['id'],
        where: { abbrev: 'TWSE' },
        nest: true,
        raw: true
      }),
      // 找Raw_stock_group更新的資料,且不存在Stock_group
      RawStockGroup.findAll({
        attributes: ['groupName', 'groupCode'],
        where: {
          groupName: {
            [Op.notIn]: sequelize.literal(`(${addDataSubquery})`)
          },
          $and: sequelize.where(sequelize.fn('date', sequelize.col('updated_at')), '=', currentDate)
        },
        raw: true
      })
    ])
      .then(([exchangeId, createData]) => {
        if (!createData.length) return 'No data has been added to the Stock_group table.'

        // 依序建立資料
        return createData.map(item => (
          StockGroup.create({
            id: item.id,
            groupName: item.groupName,
            groupCode: item.groupCode,
            exchangeId: exchangeId[0].id
          })
        ))
      })
      .then(msg => console.log(msg))

    // 刪除Stock_group的資料
    Promise.all([
      // 查詢不在Raw_stock_group起訖日區間的資料
      StockGroup.findAll({
        where: { id: { [Op.notIn]: sequelize.literal(`(${removeDataSubquery})`) } }
      })]
    )
      .then(([deleteData]) => {
        if (!deleteData.length) return 'No data has been removed from Stock_group table.'

        return deleteData.map(item => (
          item.destroy()
        ))
      })
      .then(msg => console.log(msg))
  },
  // 抓Raw_stocks資料
  rawStocks: async () => {
    const stocks = {}
    const targetUrls = []
    const TIMEOUT = 4000

    // 查詢is_target為true的樣本類股清單
    await StockGroup.findAll({
      attributes: ['id', 'groupName', 'groupCode'],
      where: { isTarget: true },
      raw: true
    })
      .then(stockGroups => {
        // 設定抓資料的清單
        stockGroups.forEach(stockGroup => {
          // 類股清單的API
          const TARGET_URL = `https://www.twse.com.tw/rwd/zh/api/codeFilters?filter=${stockGroup.groupCode}`
          const group = {
            groupUrl: TARGET_URL,
            groupId: stockGroup.id
          }
          return targetUrls.push(group)
        })
        return stockGroups
      })
    // 依序抓資料，用setTimeout避免被判定為DDoS
    for (let index = 0; index < targetUrls.length; index++) {
      await new Promise(resolve => {
        setTimeout(() => {
          const result = targetUrls[index]
          console.log(result)

          axios.get(targetUrls[index].groupUrl)
            .then(body => body.data.result)
            .then(stocksData => {
              stocks[`${result.groupId}`] = stocksData
              resolve()
            })
            .catch(err => {
              console.log(err)
              resolve()
            })
        }, TIMEOUT)
      })
    }

    return stocks
  },
  // 匯入資料到Raw_stocks或是從Raw_stocks刪除資料
  createRawStock: async data => {
    const dataKeys = Object.keys(data)
    const dataValues = Object.values(data)
    const dataExtracted = []

    // 資料處理段
    console.log('================== Data extracting ==================')
    // 處理第i組分類的第j個股票的內容
    for (let i = 0; i < dataValues.length; i++) {
      for (let j = 0; j < dataValues[i].length; j++) {
        const dataSplit = dataValues[i][j].split('\t')
        // 把groupId塞到dataSplit
        dataSplit.push(Number(dataKeys[i]))
        // 轉成object,並推到dataExtracted
        dataExtracted.push({
          tradeCode: dataSplit[0],
          name: dataSplit[1],
          groupId: dataSplit[2]
        })
      }
    }
    // 新增段
    console.log('================== Data adding ==================')
    // 依序處理
    await dataExtracted.map(stock => {
      // 找出dataExtracted的元素是否存在Raw_stock
      return RawStock.findOne({
        where: { tradeCode: stock.tradeCode, name: stock.name },
        raw: true
      })
        .then(stockInfo => {
          // 若有,就不處理
          if (stockInfo) return `Data [ ${stockInfo.tradeCode} - ${stockInfo.name} ] remains unchanged.`
          // 若無,新增該筆資料(預設新增日都是今天)
          return RawStock.create({
            tradeCode: stock.tradeCode,
            name: stock.name,
            groupId: stock.groupId,
            beginDate: currentDate,
            endDate: '2999-12-31'
          })
        })
        .then(msg => (typeof (msg) === 'object') ? console.log(`Data [ ${msg.toJSON().tradeCode} - ${msg.toJSON().name} ] is added.`) : console.log(msg))
    })

    // 剔除段
    console.log('================== Data removing ==================')
    await RawStock.findAll({
      where: {
        beginDate: { [Op.lte]: date },
        endDate: { [Op.gt]: date }
      }
    })
      .then(stockList => {
        Promise.all(
          stockList.map(item => {
            // 若DB資料且抓檔也有資料,不處理
            if (dataExtracted.some(x => x.tradeCode === item.toJSON().tradeCode)) return `Data [ ${item.tradeCode} - ${item.name} ] remains unchanged.`
            // 若DB有資料且抓檔沒有資料,更新結束日
            return item.update({
              endDate: new Date()
            })
          })
        )
          .then(msg => console.log(msg))
          .catch(err => console.error(err))
      })
  },
  // Raw_stocks衍生到 Stocks
  deriveToStocks: async () => {
    const addDataSubquery = 'select trade_code from stocks'
    const updateDataSubquery = `select id from raw_stocks where date(updated_at) = '${currentDate}' and end_date != '2999-12-31'`
    // 化學生技醫療業和電子業
    const EXCLUDE_GROUPS = [26, 34]

    // 新增資料到Stock
    await Promise.all([
      RawStock.findAll({
        where: {
          tradeCode: { [Op.notIn]: sequelize.literal(`(${addDataSubquery})`) },
          $and: sequelize.where(sequelize.fn('date', sequelize.col('updated_at')), '=', currentDate),
          groupId: { [Op.notIn]: EXCLUDE_GROUPS }
        },
        raw: true
      })
    ])
      .then(([createData]) => {
        if (!createData.length) return 'No data has been added to the Stock table.'

        return createData.map(item => (
          Stock.create({
            id: item.id,
            tradeCode: item.tradeCode,
            name: item.name,
            isListed: 1,
            groupId: item.groupId
          })
        ))
      })
      .then(msg => console.log(msg))

    // 剔除段: 更新資料
    await Promise.all([
      Stock.findAll({
        where: {
          id: { [Op.in]: sequelize.literal(`(${updateDataSubquery})`) }
        }
      })
    ])
      .then(([updateData]) => {
        if (!updateData.length) return 'No data has been updated from Stock table.'

        return updateData.map(item => item.update({ isListed: 0 }))
      })
      .then(msg => console.log(msg))
  },
  // 抓Raw_prices資料
  rawStockPrices: async () => {
    const stocks = []
    const targetUrls = []
    const TIMEOUT = 2500

    await Stock.findAll({
      attributes: ['id', 'tradeCode'],
      where: { isListed: true },
      raw: true
    })
      .then(stocks => {
        // 設定抓資料的清單
        stocks.forEach(stock => {
          const TARGET_URL = `https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=${currentDateForAPI}&stockNo=${stock.tradeCode}&response=json`
          const group = {
            stockUrl: TARGET_URL,
            stockId: stock.id,
            tradeCode: stock.tradeCode
          }
          return targetUrls.push(group)
        })
        return stocks
      })
    // 依序抓資料，用setTimeout避免被判定為DDoS
    // targetUrls.length
    for (let index = 0; index < targetUrls.length; index++) {
      await new Promise(resolve => {
        setTimeout(() => {
          const result = targetUrls[index]
          console.log(result)

          axios.get(targetUrls[index].stockUrl)
            .then(body => body.data.data)
            .then(priceData => {
              stocks.push({
                tradeCode: result.tradeCode,
                stockId: result.stockId,
                prices: priceData
              })
              resolve()
            })
            .catch(err => {
              console.log(err)
              resolve()
            })
        }, TIMEOUT)
      })
    }
    return stocks
  },
  // 匯入資料到Raw_prices
  createRawPrice: data => {
    data.map(stock => {
      // get prices
      const prices = Object.values(stock)[2]
      // get length of prices
      const tradeDays = Object.values(stock)[2] === undefined ? 0 : prices.length
      // 若證券已下市, 忽略該筆
      if (!tradeDays) {
        const msg = `trade_code = ${stock.tradeCode} is delisted!`
        console.log(msg)
        return msg
      }
      // 依序比對交易資料
      return prices.map(price => {
        return RawPrice.findAll({
          where: {
            tradeDate: dateConverter(price[0]),
            tradeCode: Object.values(stock)[0]
          },
          raw: true
        })
          .then(tradeDay => {
            if (tradeDay.length) return `trade_code = ${tradeDay[0].tradeCode}, trade_date = ${tradeDay[0].tradeDate} is existed!`

            return RawPrice.create({
              tradeDate: dateConverter(price[0]),
              tradeCode: Object.values(stock)[0],
              openPrc: priceConverter(price[3]),
              highPrc: priceConverter(price[4]),
              lowPrc: priceConverter(price[5]),
              closePrc: priceConverter(price[6]),
              tradeCnt: stringToNumber(price[8]),
              tradeVol: stringToNumber(price[1]),
              tradeAmt: stringToNumber(price[2]),
              diffPrc: price[7],
              stockId: Object.values(stock)[1]
            })
          })
          .then(msg => (typeof (msg) === 'object') ? console.log(`Data [ ${msg.toJSON().tradeCode} - ${msg.toJSON().tradeDate} ] is added.`) : console.log(msg))
          .catch(err => console.log(err))
      })
    })
  },
  // Raw_prices衍生到 Prices
  deriveToPrices: () => {
    const addDataSubquery = 'select trade_date, stock_id from prices'
    RawPrice.findAll({
      where: {
        [Op.and]: [
          sequelize.where(sequelize.literal('(trade_date, stock_id)'), 'not in', sequelize.literal(`(${addDataSubquery})`)),
          sequelize.where(sequelize.fn('date', sequelize.col('updated_at')), '=', currentDate)
        ]
      },
      raw: true
    })
      .then(prices => {
        prices.map(price => {
          return Price.create({
            tradeDate: price.tradeDate,
            stockId: price.stockId,
            openPrc: price.openPrc,
            highPrc: price.highPrc,
            lowPrc: price.lowPrc,
            closePrc: price.closePrc,
            tradeCnt: price.tradeCnt,
            tradeVol: price.tradeVol,
            tradeAmt: price.tradeAmt,
            diffPrc: diffPrcConverter(price.diffPrc)
          })
            .then(msg => (typeof (msg) === 'object') ? console.log(`Data [ ${msg.toJSON().stockId} - ${msg.toJSON().tradeDate} ] is added.`) : console.log(msg))
            .catch(err => console.log(err))
        })
      })
  },
  // 衍生 Prices的報價為NULL的資料
  nullPrices: () => {
    // 找出報價都為null或是0的資料
    Price.findAll({
      where: {
        openPrc: { [Op.or]: [null, 0] },
        highPrc: { [Op.or]: [null, 0] },
        lowPrc: { [Op.or]: [null, 0] },
        closePrc: { [Op.or]: [null, 0] },
        $and: sequelize.where(sequelize.fn('date', sequelize.col('updated_at')), '=', currentDate)
      },
      order: [['stockId', 'ASC'], ['tradeDate', 'ASC']],
      raw: true
    })
      .then(nullPrices => {
        // 依序找出各自前一筆的資料
        for (let i = 0; i < nullPrices.length; i++) {
          Price.findAll({
            where: {
              tradeDate: { [Op.lt]: nullPrices[i].tradeDate },
              stockId: nullPrices[i].stockId
            },
            order: [['tradeDate', 'DESC']],
            limit: 1,
            raw: true
          })
            .then(previousRecord => {
              // 不處理第一筆報價缺漏
              if (!previousRecord[0]) return `[ ${nullPrices[i].stockId} - ${nullPrices[i].tradeDate} ] is the first record`
              // 不處理前一天也是null的狀況
              if (previousRecord[0].closePrc === null) return `[ ${nullPrices[i].stockId} - ${nullPrices[i].tradeDate} ] and previous trade day's close price are null`

              return Price.update({
                openPrc: Number(previousRecord[0].closePrc),
                highPrc: Number(previousRecord[0].closePrc),
                lowPrc: Number(previousRecord[0].closePrc),
                closePrc: Number(previousRecord[0].closePrc)
              }, {
                where: {
                  tradeDate: nullPrices[i].tradeDate,
                  stockId: nullPrices[i].stockId
                }
              })
            })
            .then(msg => (typeof (msg) === 'object') ? console.log(`Data [ ${nullPrices[i].stockId} - ${nullPrices[i].tradeDate} ] is updated.`) : console.log(msg))
            .catch(err => console.log(err))
        }
      })
  }
}

module.exports = databaseServices
