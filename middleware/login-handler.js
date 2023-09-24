const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userSignIn = async (req, res, next) => {
  try {
    const { account, password } = req.body
    if (!account || !password) throw new Error('帳號或密碼不得為空白！')

    const user = await User.findOne({ where: { account } })
    if (!user) throw new Error('帳號或密碼錯誤!')
    if (user.isAdmin !== false) throw new Error('使用者不存在!')

    const isPasswordMatched = await bcrypt.compare(password, user.password)
    if (!isPasswordMatched) throw new Error('帳號或密碼錯誤!')
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

const adminSignIn = async (req, res, next) => {
  console.log(req)
  try {
    const { account, password } = req.body
    if (!account || !password) throw new Error('帳號與密碼皆為必填！')

    const admin = await User.findOne({ where: { account } })
    if (!admin || (admin.isAdmin !== true)) throw new Error('使用者不存在！')
    if (!bcrypt.compareSync(password, admin.password)) throw new Error('帳號或密碼錯誤！')

    req.user = admin
    next()
  } catch (err) {
    next(err)
  }
}
module.exports = {
  userSignIn,
  adminSignIn
}
