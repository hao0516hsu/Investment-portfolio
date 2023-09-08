const databaseServices = require('../services/database-services')

const databaseController = {
  rawStockGroups: async () => {
    Promise.all([databaseServices.rawStockGroups()])
      .then(rawStockGroups => databaseServices.createRawStockGroups(rawStockGroups[0]))
  },
  deriveToStockGroup: () => {
    databaseServices.deriveToStockGroup()
  }
}

module.exports = databaseController
