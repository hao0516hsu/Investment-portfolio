// 引入Models
const { sequelize, RawStockGroup, StockGroup, Exchange } = require('../models')
const { Op } = require('sequelize')
// puppeteer: 模擬抓資料的套件
const puppeteer = require('puppeteer')
// chromium: 模擬Chrome的套件
const chromium = require('chromium')
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
  }
}

module.exports = databaseServices
