// - 處理 api 相關路徑總路由器
const router = require('express').Router()
const passport = require('passport')
const admin = require('./modules/admin')
const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')

const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')

const { apiErrorHandler } = require('../../middleware/error-handler')
const upload = require('../../middleware/multer')

router.use('/admin', authenticated, authenticatedAdmin, admin)

router.get('/restaurants', authenticated, restController.getRestaurants)

router.get('/users/:id/favorite', authenticated, userController.getFavoritedRestaurants)
router.get('/users/:id', authenticated, userController.getUser)
router.put(
  '/users/:id',
  authenticated,
  upload.single('image'),
  userController.putUser
)

router.post(
  '/signin',
  passport.authenticate('local', { session: false }),
  userController.signIn
)
router.post('/signup', userController.signUp)

router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

router.use('/', apiErrorHandler) // - api 專用 error handler

module.exports = router
