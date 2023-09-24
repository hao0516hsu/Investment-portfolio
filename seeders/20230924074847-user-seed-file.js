'use strict'
const bcrypt = require('bcryptjs')
const USERS = require('../data/seeds/users.json').users
const PORTFOLIO = require('../data/seeds/portfolios.json').portfolio

// 整理使用者種子資料
USERS.forEach(user => {
  user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10))
  user.created_at = new Date()
  user.updated_at = new Date()
})

// 整理投資組合種子資料
PORTFOLIO.forEach(portfolio => {
  portfolio.created_at = new Date()
  portfolio.updated_at = new Date()
})

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', USERS, {})
    await queryInterface.bulkInsert('Portfolios', PORTFOLIO, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {})
  }
}
