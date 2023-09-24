const databaseServices = require('../services/database-services')
const TIMER = 5000

const databaseController = {
  // 股票分類
  rawStockGroups: () => {
    // 執行抓檔
    Promise.all([databaseServices.rawStockGroups()])
      // 匯入
      .then(rawStockGroups => databaseServices.createRawStockGroups(rawStockGroups[0]))
      // 衍生
      .then(() => databaseServices.deriveToStockGroup())
  },
  // 股票資料
  rawStocks: () => {
    databaseServices.rawStocks()
      .then(rawStocks => databaseServices.createRawStock(rawStocks))
      .then(() => databaseServices.deriveToStocks())
  },
  // 股票報價
  rawStockPrices: () => {
    databaseServices.rawStockPrices()
      .then(rawStockPrices => databaseServices.createRawPrice(rawStockPrices))
  },
  // 股票報價衍生
  deriveToPrices: async () => {
    await databaseServices.deriveToPrices()
    setTimeout(() => { databaseServices.nullPrices() }, TIMER)
  },
  // 衍生均價
  deriveToAvgprices: dataDate => {
    databaseServices.deriveToAvgprices(dataDate)
    setTimeout(() => { databaseServices.deriveToAvgpriceAcross(dataDate) }, TIMER)
  },
  // 衍生累計交易日
  tradedayCnt: () => {
    databaseServices.tradedayCnt()
  }
}

module.exports = databaseController
