const adminServices = require('../services/admin-services')
const adminController = {
  getExchanges: (req, res, next) => {
    adminServices.getExchanges(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  getStockGroups: (req, res, next) => {
    adminServices.getStockGroups(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  getStocks: (req, res, next) => {
    adminServices.getStocks(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  getTradeDates: (req, res, next) => {
    adminServices.getTradeDates(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  }
}

module.exports = adminController
