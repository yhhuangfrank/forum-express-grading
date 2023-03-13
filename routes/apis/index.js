// - 處理 api 相關路徑總路由器
const router = require('express').Router()
const passport = require('passport')
const admin = require('./modules/admin')
const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')

const { apiErrorHandler } = require('../../middleware/error-handler')

router.use('/admin', admin)

router.get('/restaurants', restController.getRestaurants)

router.post(
  '/signin',
  passport.authenticate('local', { session: false }),
  userController.signIn
)

router.use('/', apiErrorHandler) // - api 專用 error handler

module.exports = router
