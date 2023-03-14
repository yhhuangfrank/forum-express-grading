const { User, Restaurant, Comment, Favorite, sequelize } = require('../models')
const bcrypt = require('bcryptjs')
const { getUser } = require('../helpers/auth-helpers')
const { imgurFileHandler } = require('../helpers/file-helpers')

const userServices = {
  signUp: async (req, cb) => {
    const { name, email, password, passwordCheck } = req.body
    // - 驗證表單
    try {
      if (!name || !email || !password || !passwordCheck) {
        throw new Error('All inputs are required!')
      }

      if (password !== passwordCheck) {
        throw new Error('Passwords do not match')
      }
      const foundUser = await User.findOne({ where: { email } })

      if (foundUser) throw new Error('User already exists!')

      const hash = bcrypt.hashSync(password, 10)
      const registeredUser = await User.create({ name, email, password: hash })

      return cb(null, { user: registeredUser })
    } catch (error) {
      return cb(error)
    }
  },
  getUser: async (req, cb) => {
    const { id } = req.params
    try {
      const foundUser = await User.findByPk(id, { raw: true })

      if (!foundUser) throw new Error('使用者不存在!')

      // - 查詢跟目前  user 相關資訊
      const [userData, userComments] = await Promise.all([
        User.findByPk(id, {
          include: [
            {
              model: Restaurant,
              as: 'FavoritedRestaurants',
              attributes: ['id', 'image']
            },
            { model: User, as: 'Followers', attributes: ['id', 'image'] },
            { model: User, as: 'Followings', attributes: ['id', 'image'] }
          ],
          nest: true
        }),
        Comment.findAll({
          include: [
            { model: Restaurant, attributes: ['image'], required: true }
          ],
          attributes: [
            [
              sequelize.fn('DISTINCT', sequelize.col('Restaurant.id')),
              'restaurantId'
            ]
          ],
          where: { userId: id },
          order: [['created_at', 'DESC']],
          nest: true,
          raw: true
        })
      ])
      return cb(null, {
        user: userData.toJSON(),
        userComments
      })
    } catch (error) {
      return cb(error)
    }
  },
  editUser: async (req, cb) => {
    const { id } = req.params
    try {
      if (getUser(req).id !== Number(id)) {
        throw new Error('無法存取非本人帳戶!')
      }
      const user = await User.findByPk(id, { raw: true })
      if (!user) throw new Error('使用者不存在!')
      return cb(null, { user })
    } catch (error) {
      return cb(error)
    }
  },
  putUser: async (req, cb) => {
    const { id } = req.params
    const { name } = req.body
    const { file } = req
    try {
      if (getUser(req).id !== Number(id)) {
        throw new Error('無法存取非本人帳戶!')
      }
      if (!name) throw new Error('名稱為必填!')
      const [user, filePath] = await Promise.all([
        User.findByPk(id),
        imgurFileHandler(file)
      ])
      const updatedUser = await user.update({
        name,
        image: filePath || user.image
      })
      return cb(null, { user: updatedUser })
    } catch (error) {
      return cb(error)
    }
  },
  addFavorite: async (req, cb) => {
    const { restaurantId } = req.params
    const userId = getUser(req).id
    try {
      const [restaurant, favorite] = await Promise.all([
        Restaurant.findByPk(restaurantId),
        Favorite.findOne({
          where: {
            userId,
            restaurantId
          }
        })
      ])
      if (!restaurant) throw new Error('餐廳不存在!')
      if (favorite) throw new Error('你已收藏過此餐廳!')

      const result = await Favorite.create({
        userId,
        restaurantId
      })
      return cb(null, { result })
    } catch (error) {
      return cb(error)
    }
  },
  removeFavorite: async (req, cb) => {
    const { restaurantId } = req.params
    const userId = getUser(req).id
    try {
      const favorite = await Favorite.findOne({
        where: {
          userId,
          restaurantId
        }
      })

      if (!favorite) throw new Error('你尚未收藏過此餐廳!')

      const deletedResult = await favorite.destroy()

      return cb(null, { deletedResult })
    } catch (error) {
      return cb(error)
    }
  }
}

module.exports = userServices
