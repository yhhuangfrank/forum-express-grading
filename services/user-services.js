const { User, Restaurant, Comment, sequelize } = require('../models')
const bcrypt = require('bcryptjs')

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
  }
}

module.exports = userServices
