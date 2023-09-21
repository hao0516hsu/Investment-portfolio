const express = require('express')
const router = express.Router()

// 引用modules的路由
const admin = require('./modules/admin')

// controller
const portfolioController = require('../controllers/portfolio-controller')
const userController = require('../controllers/user-controller')

// middleware
const { apiErrorHandler } = require('../middleware/error-handler')
const { userSignIn, adminSignIn } = require('../middleware/login-handler')
const { authenticated, authenticatedAdmin } = require('../middleware/api-auth')

// 後台驗證
router.use('/admin', authenticated, authenticatedAdmin, admin)

// 路由：帳號登入(後台)
router.post('/admin/signin', adminSignIn, userController.signIn)
// 路由：註冊帳號
router.post('/signup', userController.signUp)
// 路由：帳號登入(前台)
router.post('/signin', userSignIn, userController.signIn)

// 路由: 特定個股資訊
router.get('/stocks/:id', portfolioController.getStock)
// 路由: 前台首頁
router.get('/stocks', portfolioController.getStocks)
// 路由: 股票清單
router.get('/stocklist', portfolioController.getStockList)
// 路由: 投資組合清單(Portfolio)
router.patch('/portfolio/:id', authenticated, portfolioController.patchPortfolio)
router.delete('/portfolio/:id', authenticated, portfolioController.deletePortfolio)
router.get('/portfolio', authenticated, portfolioController.getPortfolio)
router.post('/portfolio', authenticated, portfolioController.postPortfolio)

router.use('/', apiErrorHandler)
module.exports = router
