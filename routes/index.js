const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')
const userController = require('../controllers/user-controller')
const restController = require('../controllers/restaurant-controller')
const { generalErrorHandler } = require('../middleware/error-handler')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const passport = require('passport')

router.use('/admin', authenticatedAdmin, admin)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post(
  '/signin',
  passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }),
  userController.signIn
)
router.get('/logout', userController.logout)

router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)

// - 將其餘無對應路由導向restaurants頁面
router.use('/', (req, res) => res.redirect('/restaurants'))

router.use('/', generalErrorHandler)

module.exports = router
