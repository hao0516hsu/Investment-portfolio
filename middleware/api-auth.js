const passport = require('../config/passport')

const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  console.log(req.user.toJSON())
  if (req.user && req.user.toJSON().isAdmin) return next()
  return res.status(403).json({ status: 'error', message: 'permission denied' })
}

module.exports = { authenticated, authenticatedAdmin }
