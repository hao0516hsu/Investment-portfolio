// 引入Models
const { sequelize, Exchange, RawStockGroup, StockGroup, RawStock } = require('../models')
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

const databaseServices = {
  // 抓raw_stock_groups資料
  rawStockGroups: () => {
    const TARGET_URL = 'https://www.twse.com.tw/zh/listed/profile/company.html'
    const TARGET_MODAL = '.stock-code-browse'

    // 以下操作都是匿名函式
    return (async () => {
      // 啟動模擬瀏覽器
      const browser = await puppeteer.launch({
        headless: false,
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
  // RawStockGroups CRUD
  createRawStockGroups: data => {
    // 新增段
    // 逐筆搜尋資料庫是否有該筆資料
    Promise.all(data.map(async item => {
      return await RawStockGroup.findOne({
        where: {
          group_name: item.groupName,
          begin_date: {
            [Op.lte]: date
          },
          end_date: {
            [Op.gt]: date
          }
        }
      })
        .then(isExisted => {
          // 若有,表示不必更新
          if (isExisted) return `Data ${item.name} kept unchanged.`
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
        begin_date: {
          [Op.lte]: date
        },
        end_date: {
          [Op.gt]: date
        }
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
  // RawStockGroups Derives To StockGroups
  deriveToStockGroup: () => {
    const addDataSubquery = 'select group_name from stock_groups'
    const removeDataSubquery = `select group_name from raw_stock_groups where date(updated_at) = "${currentDate}"`
    // Add Data To Stock_Group
    Promise.all([
      Exchange.findAll({
        attributes: ['id'],
        where: { abbrev: 'TWSE' },
        nest: true,
        raw: true
      }),
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

        return createData.map(item => (
          StockGroup.create({
            groupName: item.groupName,
            groupCode: item.groupCode,
            exchangeId: exchangeId[0].id
          })
        ))
      })
      .then(msg => console.log(msg))

    // Remove Data From Stock_Group
    Promise.all([
      StockGroup.findAll({
        attributes: ['groupName', 'groupCode'],
        where: {
          groupName: {
            [Op.notIn]: sequelize.literal(`(${removeDataSubquery})`)
          }
        },
        raw: true
      })]
    )
      .then(([deleteData]) => {
        if (!deleteData.length) return 'No data has been removed from Stock_group table.'

        return deleteData.map(item => (
          StockGroup.destroy({
            where: { groupName: item.groupName }
          })
        ))
      })
      .then(msg => console.log(msg))
  },
  // 抓raw_stock資料
  rawStocks: async () => {
    const stocks = {}
    const targetUrls = []
    const TIMEOUT = 4000

    await StockGroup.findAll({
      attributes: ['id', 'groupName', 'groupCode'],
      where: { isTarget: true },
      raw: true
    })
      .then(stockGroups => {
        // 設定抓資料的清單
        stockGroups.forEach(stockGroup => {
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
          // stocks[index] = result
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
  // RawStock CRUD
  createRawStock: async data => {
    const dataKeys = Object.keys(data)
    const dataValues = Object.values(data)
    const dataExtracted = []

    // 資料處理段
    console.log('================== Data extracting ==================')

    for (let i = 0; i < dataValues.length; i++) {
      for (let j = 0; j < dataValues[i].length; j++) {
        const dataSplit = dataValues[i][j].split('\t')
        dataSplit.push(Number(dataKeys[i]))

        dataExtracted.push({
          tradeCode: dataSplit[0],
          name: dataSplit[1],
          groupId: dataSplit[2]
        })
      }
    }
    // 新增段
    console.log('================== Data adding ==================')
    await dataExtracted.map(stock => {
      return RawStock.findOne({
        where: { tradeCode: stock.tradeCode, name: stock.name },
        raw: true
      })
        .then(stockInfo => {
          if (stockInfo) return `Data [ ${stockInfo.tradeCode} - ${stockInfo.name} ] remains unchanged.`

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
        beginDate: {
          [Op.lte]: date
        },
        endDate: {
          [Op.gt]: date
        }
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
  }
}

module.exports = databaseServices
