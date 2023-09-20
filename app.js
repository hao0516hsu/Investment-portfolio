if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const passport = require('passport')

const app = express()
const port = process.env.PORT || 3000

const routes = require('./routes/index')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(passport.initialize())

app.use('/api', routes)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
