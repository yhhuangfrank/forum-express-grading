const { Restaurant, Category, User, Comment, sequelize } = require('../../models')
const { getUser } = require('../../helpers/auth-helpers')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')

const restaurantController = {
  getRestaurants: async (req, res, next) => {
    const DEFAULT_LIMIT = 9
    const FIRST_PAGE = 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const page = Number(req.query.page) || FIRST_PAGE
    const offset = getOffset(limit, page)
    const categoryId = Number(req.query.categoryId) || ''
    try {
      const [restaurants, categories] = await Promise.all([
        Restaurant.findAndCountAll({
          raw: true,
          nest: true,
          where: {
            ...(categoryId ? { categoryId } : {}) // -進行判斷後再展開
          },
          limit,
          offset,
          include: [Category]
        }),
        Category.findAll({ raw: true })
      ])
      // - 對原有description進行字數刪減
      const MAX_OF_DESCRIPTION_LENGTH = 50

      // -查找使用者收藏、喜愛過的餐廳 id
      const favoritedRestaurantsId = getUser(req)?.FavoritedRestaurants ? getUser(req).FavoritedRestaurants.map(fr => fr.id) : []
      const likedRestaurantsId = getUser(req)?.LikedRestaurants ? getUser(req).LikedRestaurants.map(lr => lr.id) : []

      const data = restaurants.rows.map(r => ({
        ...r,
        description: r.description.substring(0, MAX_OF_DESCRIPTION_LENGTH),
        // -判斷每間餐廳是否被使用者收藏過
        isFavorited: getUser(req) && favoritedRestaurantsId.includes(r.id),
        isLiked: getUser(req) && likedRestaurantsId.includes(r.id)
      }))
      // - 使用 json 格式輸出資料
      return res.json({
        restaurants: data,
        categories,
        categoryId,
        pagination: getPagination(limit, page, restaurants.count)
      })
    } catch (error) {
      return next(error)
    }
  }
}

module.exports = restaurantController
