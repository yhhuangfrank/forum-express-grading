const path = require('path')
const express = require('express')
const handlebars = require('express-handlebars')
const usePassport = require('./config/passport')
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const { getUser } = require('./helpers/auth-helpers')
const handlebarsHelpers = require('./helpers/handlebars-helper')
const routes = require('./routes')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = 'SECRET'

app.engine(
  'hbs',
  handlebars({
    extname: '.hbs',
    helpers: handlebarsHelpers
  })
)
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false
  })
)
usePassport(app)
app.use(flash())
app.use(methodOverride('_method'))
// - 存取上傳圖片(static file)
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.warning_messages = req.flash('warning_messages')
  res.locals.loginUser = getUser(req)
  next()
})
app.use(routes)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
