// - 處理 api 相關路徑總路由器
const router = require('express').Router()
const passport = require('passport')
const admin = require('./modules/admin')
const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')

const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')

const { apiErrorHandler } = require('../../middleware/error-handler')

router.use('/admin', authenticated, authenticatedAdmin, admin)

router.get('/restaurants', authenticated, restController.getRestaurants)

router.post(
  '/signin',
  passport.authenticate('local', { session: false }),
  userController.signIn
)
router.post('/signup', userController.signUp)

router.use('/', apiErrorHandler) // - api 專用 error handler

module.exports = router
