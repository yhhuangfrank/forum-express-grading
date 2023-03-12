// - 讓資料處理交給 Service, Controller 負責接收與回應請求
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    // - 將 req 與 callback function 傳入 Service
    restaurantServices.getRestaurants(req, (err, data) =>
      err ? next(err) : res.json(data)
    )
  }
}

module.exports = restaurantController
