const databaseServices = require('../services/database-services')

const databaseController = {
  rawStockGroups: async () => {
    Promise.all([databaseServices.rawStockGroups()])
      .then(rawStockGroups => databaseServices.createRawStockGroups(rawStockGroups[0]))
  },
  deriveToStockGroup: () => {
    databaseServices.deriveToStockGroup()
  },
  rawStocks: () => {
    databaseServices.rawStocks()
      .then(rawStocks => databaseServices.createRawStock(rawStocks))
  }
}

module.exports = databaseController
