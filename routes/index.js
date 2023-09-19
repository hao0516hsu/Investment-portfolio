const express = require('express')
const router = express.Router()

const portfolioController = require('../controllers/portfolio-controller')

// 路由: 特定個股資訊
router.get('/stocks/:id', portfolioController.getStock)
// 路由: 前台首頁
router.get('/stocks', portfolioController.getStocks)
// 路由: 股票清單
router.get('/stocklist', portfolioController.getStockList)

module.exports = router
