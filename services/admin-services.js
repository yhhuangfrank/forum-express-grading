const { Restaurant, User, Category } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const adminServices = {
  getRestaurants: async (req, cb) => {
    const DEFAULT_LIMIT = 8
    const FIRST_PAGE = 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const page = Number(req.query.page) || FIRST_PAGE
    const offset = getOffset(limit, page)
    try {
      const restaurants = await Restaurant.findAndCountAll({
        raw: true,
        nest: true, // -將關聯資料包裝成物件
        include: [Category], // -取得關聯資料
        limit,
        offset
      })
      return cb(null, {
        restaurants: restaurants.rows,
        pagination: getPagination(limit, page, restaurants.count)
      })
    } catch (error) {
      return cb(error)
    }
  },
  deleteRestaurant: async (req, cb) => {
    const { id } = req.params
    try {
      const restaurant = await Restaurant.findByPk(id)
      if (!restaurant) {
        const err = new Error('此餐廳不存在!')
        err.status = 404
        throw err
      }
      const deletedRestaurant = await restaurant.destroy()
      return cb(null, { restaurant: deletedRestaurant })
    } catch (error) {
      return cb(error)
    }
  },
  postRestaurant: async (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } =
      req.body
    const { file } = req // - 取圖片檔
    try {
      if (!name) throw new Error('Restaurant name is required!')
      const filePath = await imgurFileHandler(file)
      const newRestaurant = await Restaurant.create({
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || null,
        categoryId
      })
      return cb(null, { restaurant: newRestaurant })
    } catch (error) {
      return cb(error)
    }
  }
}

module.exports = adminServices
