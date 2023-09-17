const portfolioService = require('../services/portfolio-service')
const portfolioController = {
  getStock: (req, res, next) => {
    portfolioService.getStock(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  }
}

module.exports = portfolioController
