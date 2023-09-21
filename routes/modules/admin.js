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
router.get('/stockgroups', adminController.getStockGroups)

// 路由: 股票資料相關
router.get('/stocks', adminController.getStocks)

// 路由: 交易日相關
router.get('/tradedates', adminController.getTradeDates)

module.exports = router
