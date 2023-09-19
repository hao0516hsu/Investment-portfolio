const bcrypt = require('bcryptjs')
const { User } = require('../models')
const { Op } = require('sequelize')

const userServices = {
  // 帳號註冊
  signUp: (req, cb) => {
    const { account, name, email, password, confirmPassword } = req.body
    if (password !== confirmPassword) throw new Error('密碼不一致！')
    if ((account.length < 6) || (account.length > 20)) throw new Error('請輸入6到20字元的帳號！')
    if ((name.length < 6) || (name.length > 20)) throw new Error('請輸入6到20字元的名稱！')
    if (!email.includes('@')) throw new Error('Email格式錯誤！')
    if ((password.length < 8) || (password.length > 20)) throw new Error('請輸入8到20字元的密碼！')

    User.findOne({
      where: {
        [Op.or]: {
          email,
          account
        }
      },
      raw: true
    })
      .then(user => {
        console.log(user)
        if ((user) && (user.email === email)) throw new Error('此Email已被註冊！')
        if ((user) && (user.account === account)) throw new Error('此帳號已被註冊！')

        return bcrypt.hash(password, 10)
      })
      .then(hash => {
        return User.create({
          account,
          name,
          email,
          password: hash,
          isAdmin: false
        })
      })
      .then(newUser => {
        const userData = newUser.toJSON()
        delete userData.password

        return cb(null, { user: userData })
      })
      .catch(err => cb(err))
  }
}

module.exports = userServices
