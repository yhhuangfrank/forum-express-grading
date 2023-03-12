const router = require('express').Router()
const adminController = require('../../../controllers/pages/admin-controller')
const categoryController = require('../../../controllers/pages/category-controller')
const upload = require('../../../middleware/multer')

router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put(
  '/restaurants/:id',
  upload.single('image'),
  adminController.putRestaurant
)
router.get('/restaurants', adminController.getRestaurants)
router.post(
  '/restaurants',
  upload.single('image'),
  adminController.postRestaurant
)
router.delete('/restaurants/:id', adminController.deleteRestaurant)

router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)

router.get('/categories/:id', categoryController.getCategories)
router.put('/categories/:id', categoryController.putCategory)
router.patch('/categories/:id', categoryController.pathCategory)
router.get('/categories', categoryController.getCategories)
router.post('/categories', categoryController.postCategory)

router.use('/', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router