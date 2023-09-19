const portfolioService = require('../services/portfolio-service')
const portfolioController = {
  getStock: (req, res, next) => {
    portfolioService.getStock(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  getStocks: (req, res, next) => {
    portfolioService.getStocks(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  getStockList: (req, res, next) => {
    portfolioService.getStockLists(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  }
}

module.exports = portfolioController
