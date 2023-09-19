const express = require('express')
const router = express.Router()
// const passport = require('../config/passport')

// controller
const portfolioController = require('../controllers/portfolio-controller')
const userController = require('../controllers/user-controller')

// middleware
const { apiErrorHandler } = require('../middleware/error-handler')
const { userSignIn, adminSignIn } = require('../middleware/login-handler')
// const { authenticated, authenticatedAdmin } = require('../middleware/api-auth')

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

router.use('/', apiErrorHandler)
module.exports = router
