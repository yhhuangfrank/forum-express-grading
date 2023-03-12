// - 處理屬於前台restaurant路由的相關請求
const {
  Restaurant,
  Category,
  User,
  Comment,
  sequelize
} = require('../../models')
const { getUser } = require('../../helpers/auth-helpers')
const restaurantServices = require('../../services/restaurant-services')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) =>
      err ? next(err) : res.render('restaurants', data)
    )
  },
  getRestaurant: async (req, res, next) => {
    const { id } = req.params
    try {
      const restaurant = await Restaurant.findByPk(id, {
        nest: true,
        include: [
          { model: Category },
          {
            model: Comment, // -餐廳對評論為1對多，會以複數型命名屬性並以 Array 包裝資料
            include: [{ model: User }]
          },
          { model: User, as: 'FavoritedUsers' }, // -查找已收藏過的使用者
          { model: User, as: 'LikedUsers' } // -查找已喜愛過的使用者
        ],
        order: [[Comment, 'created_at', 'DESC']]
      })
      if (!restaurant) throw new Error('此餐廳不存在!')

      // - 若餐廳存在增加瀏覽次數(累加值若為1可省略第二參數)
      await restaurant.increment('viewCounts', { by: 1 })
      const userId = getUser(req).id
      const isFavorited = restaurant.FavoritedUsers.some(
        fu => fu.id === userId
      )
      const isLiked = restaurant.LikedUsers.some(lu => lu.id === userId)
      return res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        isFavorited,
        isLiked
      })
    } catch (error) {
      return next(error)
    }
  },
  getDashboard: async (req, res, next) => {
    const { id } = req.params
    try {
      const restaurant = await Restaurant.findByPk(id, {
        nest: true,
        include: [
          { model: Category, required: true }, // - INNER JOIN
          Comment,
          { model: User, as: 'FavoritedUsers' }
        ]
      })
      if (!restaurant) throw new Error('此餐廳不存在!')
      return res.render('dashboard', { restaurant: restaurant.toJSON() })
    } catch (error) {
      return next(error)
    }
  },
  getFeeds: async (req, res, next) => {
    // - 獲取最新10筆餐廳與評論
    try {
      const [restaurants, comments] = await Promise.all([
        Restaurant.findAll({
          limit: 10,
          include: [Category],
          order: [['created_at', 'DESC']],
          raw: true,
          nest: true
        }),
        Comment.findAll({
          limit: 10,
          include: [User, Restaurant],
          order: [['created_at', 'DESC']],
          raw: true,
          nest: true
        })
      ])
      return res.render('feeds', { restaurants, comments })
    } catch (error) {
      return next(error)
    }
  },
  getTopRestaurants: async (req, res, next) => {
    // - 作法一 - 在資料庫撈取全部資料再處理
    try {
      const restaurants = await Restaurant.findAll({
        include: [{ model: User, as: 'FavoritedUsers', required: true }]
      })
      const result = restaurants
        .map(r => ({
          ...r.toJSON(),
          description: r.description.substring(0, 50),
          favoritedCount: r.FavoritedUsers.length,
          isFavorited:
            getUser(req) &&
            getUser(req).FavoritedRestaurants.some(f => f.id === r.id)
        }))
        .sort((a, b) => b.favoritedCount - a.favoritedCount)
      return res.render('top-restaurants', { restaurants: result })
    } catch (error) {
      return next(error)
    }
    // - 作法二 - 在資料庫處理資料再回傳
    // try {
    //   const restaurants = await Restaurant.findAll({
    //     subQuery: false, // - 當有 limit 屬性時需加上取消子查詢屬性
    //     // -改為inner join 篩選有 FavoritedUsers 餐廳
    //     include: [{ model: User, as: 'FavoritedUsers', required: true }],
    //     // -額外查詢COUNT(`FavoritedUsers.id`) 作為排序標準
    //     attributes: {
    //       include: [
    //         [
    //           sequelize.fn('COUNT', sequelize.col('FavoritedUsers.id')),
    //           'favoritedCount'
    //         ]
    //       ]
    //     },
    //     group: 'Restaurant.id', // -GROUP BY `Restaurant.id`
    //     order: [['favoritedCount', 'DESC']],
    //     limit: 10
    //   })
    //   const result = restaurants.map(r => ({
    //     ...r.toJSON(),
    //     description: r.description.substring(0, 50),
    //     isFavorited:
    //       getUser(req) &&
    //       getUser(req).FavoritedRestaurants.some(f => f.id === r.id)
    //   }))
    //   return res.render('top-restaurants', { restaurants: result })
    // } catch (error) {
    //   return next(error)
    // }
  }
}

module.exports = restaurantController
