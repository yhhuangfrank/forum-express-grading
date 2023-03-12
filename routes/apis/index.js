// - 處理 api 相關路徑總路由器
const router = require('express').Router()
const admin = require('./modules/admin')
const restController = require('../../controllers/apis/restaurant-controller')

router.use('/admin', admin)

router.get('/restaurants', restController.getRestaurants)

module.exports = router
