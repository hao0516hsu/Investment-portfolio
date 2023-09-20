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
  },
  postPortfolio: (req, res, next) => {
    portfolioServices.postPortfolio(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  getPortfolio: (req, res, next) => {
    portfolioServices.getPortfolio(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  patchPortfolio: (req, res, next) => {
    portfolioServices.patchPortfolio(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  deletePortfolio: (req, res, next) => {
    portfolioServices.deletePortfolio(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  }
}

module.exports = portfolioController
