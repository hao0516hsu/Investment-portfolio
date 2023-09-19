const jwt = require('jsonwebtoken')
const userServices = require('../services/user-services')

const userController = {
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => err ? next(err) : res.json({ status: 'success', result: data }))
  },
  // 帳號登入
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password

      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '10d' })

      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController
