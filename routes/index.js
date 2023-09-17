const express = require('express')
const router = express.Router()

const portfolioController = require('../controllers/portfolio-controller')

// 路由: 特定個股資訊
router.get('/stocks/:id', portfolioController.getStock)

module.exports = router
