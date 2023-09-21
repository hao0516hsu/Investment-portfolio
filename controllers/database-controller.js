const databaseServices = require('../services/database-services')
const TIMER = 8000

const databaseController = {
  rawStockGroups: () => {
    // 執行抓檔
    Promise.all([databaseServices.rawStockGroups()])
      // 匯入
      .then(rawStockGroups => databaseServices.createRawStockGroups(rawStockGroups[0]))
      // 衍生
      .then(() => databaseServices.deriveToStockGroup())
  },
  rawStocks: () => {
    databaseServices.rawStocks()
      .then(rawStocks => databaseServices.createRawStock(rawStocks))
      .then(() => databaseServices.deriveToStocks())
  },
  rawStockPrices: () => {
    databaseServices.rawStockPrices()
      .then(rawStockPrices => databaseServices.createRawPrice(rawStockPrices))
  },
  deriveToPrices: async () => {
    await databaseServices.deriveToPrices()
    setTimeout(() => { databaseServices.nullPrices() }, TIMER)
  },
  deriveToAvgprices: dataDate => {
    databaseServices.deriveToAvgprices(dataDate)
    setTimeout(() => { databaseServices.deriveToAvgpriceAcross(dataDate) }, TIMER)
  },
  tradedayCnt: () => {
    databaseServices.tradedayCnt()
  }
}

module.exports = databaseController
