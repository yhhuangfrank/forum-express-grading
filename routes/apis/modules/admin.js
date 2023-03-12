const router = require('express').Router()

const adminController = require('../../../controllers/apis/admin-controller')

router.get('/restaurants', adminController.getRestaurants)

module.exports = router
