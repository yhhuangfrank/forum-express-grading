// - 引用 jwt 作為身分驗證
const jwt = require('jsonwebtoken')

const userServices = require('../../services/user-services')

const { getUser } = require('../../helpers/auth-helpers')

const userController = {
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  signIn: (req, res, next) => {
    // - 若通過 passport 驗證則簽發一組30天效期的 jwt token 並回傳
    // - 且夾帶 req.user 作為 payload (須為一個 plain object)
    try {
      const userData = req.user.toJSON() // - 將 sequelize 包裝的物件轉為簡單的物件
      delete userData.password // - 使用 delete 運算子刪除物件中的屬性
      const token = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: '30d'
      })
      return res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (error) {
      return next(error)
    }
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (err, data) => {
      if (err) return next(err)
      delete data.user.password
      return res.json({ status: 'success', data })
    })
  },
  putUser: (req, res, next) => {
    userServices.putUser(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  addFavorite: (req, res, next) => {
    userServices.addFavorite(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  removeFavorite: (req, res, next) => {
    userServices.removeFavorite(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  addFollowing: (req, res, next) => {
    userServices.addFollowing(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  removeFollowing: (req, res, next) => {
    userServices.removeFollowing(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  getFavoritedRestaurants: (req, res, next) => {
    userServices.getFavoritedRestaurants(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  getCommentedRestaurants: (req, res, next) => {
    userServices.getCommentedRestaurants(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  }
}

module.exports = userController
