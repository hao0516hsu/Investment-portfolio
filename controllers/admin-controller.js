const adminServices = require('../services/admin-services')
const adminController = {
  getExchanges: (req, res, next) => {
    adminServices.getExchanges(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  postExchange: (req, res, next) => {
    adminServices.postExchange(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  putExchange: (req, res, next) => {
    adminServices.putExchange(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  deleteExchange: (req, res, next) => {
    adminServices.deleteExchange(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  getStockGroups: (req, res, next) => {
    adminServices.getStockGroups(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  postStockGroup: (req, res, next) => {
    adminServices.postStockGroup(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  patchStockGroup: (req, res, next) => {
    adminServices.patchStockGroup(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  deleteStockGroup: (req, res, next) => {
    adminServices.deleteStockGroup(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  getStocks: (req, res, next) => {
    adminServices.getStocks(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  postStock: (req, res, next) => {
    adminServices.postStock(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  patchStock: (req, res, next) => {
    adminServices.patchStock(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  deleteStock: (req, res, next) => {
    adminServices.deleteStock(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  getTradeDates: (req, res, next) => {
    adminServices.getTradeDates(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  }
}

module.exports = adminController
