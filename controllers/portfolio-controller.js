const portfolioServices = require('../services/portfolio-services')
const portfolioController = {
  getStock: (req, res, next) => {
    portfolioServices.getStock(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  getStocks: (req, res, next) => {
    portfolioServices.getStocks(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  getStockList: (req, res, next) => {
    portfolioServices.getStockLists(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  }
}

module.exports = portfolioController
