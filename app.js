if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
// const flash = require('connect-flash')
// const session = require('express-session')
// const passport = require('./config/passport')
const passport = require('passport')

const app = express()
const port = process.env.PORT || 3000
// const SESSION_SECRET = process.env.SECRET

const routes = require('./routes/index')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
// app.use(passport.session())
/*
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  next()
})
*/

app.use('/api', routes)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
