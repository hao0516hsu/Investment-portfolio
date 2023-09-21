const express = require('express')
const router = express.Router()

// controller
const adminController = require('../../controllers/admin-controller')

// 路由: 交易所相關
router.put('/exchanges/:id', adminController.putExchange)
router.delete('/exchanges/:id', adminController.deleteExchange)
router.get('/exchanges', adminController.getExchanges)
router.post('/exchanges', adminController.postExchange)

// 路由: 股票分類相關
router.patch('/stockgroups/:id', adminController.patchStockGroup)
router.delete('/stockgroups/:id', adminController.deleteStockGroup)
router.get('/stockgroups', adminController.getStockGroups)
router.post('/stockgroups', adminController.postStockGroup)

// 路由: 股票資料相關
router.patch('/stocks/:id', adminController.patchStock)
router.delete('/stocks/:id', adminController.deleteStock)
router.get('/stocks', adminController.getStocks)
router.post('/stocks', adminController.postStock)

// 路由: 交易日相關
router.get('/tradedates', adminController.getTradeDates)

module.exports = router
