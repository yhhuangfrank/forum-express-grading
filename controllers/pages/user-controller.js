// - 處理屬於user路由的相關請求
const { User, Restaurant, Like } = require('../../models')
const userServices = require('../../services/user-services')
const { getUser } = require('../../helpers/auth-helpers')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, err => {
      if (err) return next(err)
      req.flash('success_messages', '註冊成功! 可進行登入了!')
      return res.redirect('/signin')
    })
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '已成功登入!')
    return res.redirect('/restaurants')
  },
  logout: (req, res, next) => {
    req.logout(error => {
      if (error) return next(error)
    })
    req.flash('success_messages', '已成功登出!')
    return res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (err, data) => {
      if (err) return next(err)
      const { user, userComments } = data
      return res.render('users/profile', { user, userComments })
    })
  },
  editUser: (req, res, next) => {
    userServices.editUser(req, (err, data) => {
      if (err) return next(err)
      const { user } = data
      return res.render('users/edit', { user })
    })
  },
  putUser: async (req, res, next) => {
    userServices.putUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '使用者資料編輯成功')
      const { user } = data
      return res.redirect(`/users/${user.id}`)
    })
  },
  addFavorite: (req, res, next) => {
    userServices.addFavorite(req, err => {
      if (err) return next(err)
      req.flash('success_messages', '收藏餐廳成功!')
      return res.redirect('back')
    })
  },
  removeFavorite: async (req, res, next) => {
    userServices.removeFavorite(req, err => {
      if (err) return next(err)
      req.flash('success_messages', '已取消收藏!')
      return res.redirect('back')
    })
  },
  addLike: async (req, res, next) => {
    const { restaurantId } = req.params
    const userId = getUser(req).id
    try {
      const [restaurant, like] = await Promise.all([
        Restaurant.findByPk(restaurantId),
        Like.findOne({
          where: {
            restaurantId,
            userId
          }
        })
      ])
      if (!restaurant) throw new Error('餐廳不存在!')
      if (like) throw new Error('您已 Like 過此餐廳!')

      await Like.create({
        restaurantId,
        userId
      })
      req.flash('success_messages', '添加為喜愛餐廳成功!')
      return res.redirect('back')
    } catch (error) {
      return next(error)
    }
  },
  removeLike: async (req, res, next) => {
    const { restaurantId } = req.params
    const userId = getUser(req).id
    try {
      const like = await Like.findOne({
        where: {
          restaurantId,
          userId
        }
      })
      if (!like) throw new Error('您已 Unlike 過此餐廳!!')

      await like.destroy()
      req.flash('success_messages', '從喜愛餐廳中移除成功!')
      return res.redirect('back')
    } catch (error) {
      return next(error)
    }
  },
  getTopUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({
        include: [{ model: User, as: 'Followers' }]
      })

      const result = users
        .map(user => ({
          ...user.toJSON(), // -整理格式
          followerCount: user.Followers.length,
          // - 判斷目前登入者的是否有追蹤 user 物件
          isFollowed: getUser(req).Followings.some(f => f.id === user.id)
        }))
        .sort((a, b) => b.followerCount - a.followerCount) // -按照追蹤者人數作排序

      return res.render('top-users', { users: result })
    } catch (error) {
      return next(error)
    }
  },
  addFollowing: async (req, res, next) => {
    userServices.addFollowing(req, err => {
      if (err) return next(err)
      req.flash('success_messages', '追蹤成功!')
      return res.redirect('back')
    })
  },
  removeFollowing: async (req, res, next) => {
    userServices.removeFollowing(req, err => {
      if (err) return next(err)
      req.flash('success_messages', '取消追蹤成功!')
      return res.redirect('back')
    })
  }
}

module.exports = userController
