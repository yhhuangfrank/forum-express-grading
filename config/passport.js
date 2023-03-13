const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')
const { User, Restaurant } = require('../models')

const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

module.exports = app => {
  // - initialize and session
  app.use(passport.initialize())
  app.use(passport.session())
  // - LocalStrategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const foundUser = await User.findOne({ where: { email } })
          if (!foundUser) {
            return done(
              null,
              false,
              req.flash('error_messages', '信箱或密碼輸入錯誤!')
            )
          }
          // - 用戶存在
          const isMatch = await bcrypt.compare(password, foundUser.password)
          if (!isMatch) {
            return done(
              null,
              false,
              req.flash('error_messages', '信箱或密碼輸入錯誤!')
            )
          }
          return done(null, foundUser)
        } catch (error) {
          return done(error, false)
        }
      }
    )
  )

  // - JWT Strategy
  const jwtOptions = {
    // - 從 Header 的 Bearer 抽取 token
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET // - 設定使用密鑰來檢查
  }
  passport.use(
    new JWTStrategy(jwtOptions, async (jwtPayload, done) => {
      try {
        // - 解析 payload 並進行反查 User 是否存在
        const foundUser = await User.findByPk(jwtPayload.id, {
          include: [
            { model: Restaurant, as: 'FavoritedRestaurants' },
            { model: Restaurant, as: 'LikedRestaurants' },
            { model: User, as: 'Followers' },
            { model: User, as: 'Followings' }
          ]
        })

        if (!foundUser) return done(null, false)

        // - 將查詢到的 user 資訊存入 req.user
        return done(null, foundUser)
      } catch (error) {
        return done(error, null)
      }
    })
  )

  // - serialization & deserialization
  passport.serializeUser((user, done) => {
    return done(null, user.id)
  })
  passport.deserializeUser(async (id, done) => {
    try {
      const foundUser = await User.findByPk(id, {
        // -撈取user資料時一併透過別名獲取相關資訊
        include: [
          { model: Restaurant, as: 'FavoritedRestaurants' },
          { model: Restaurant, as: 'LikedRestaurants' },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      })

      if (!foundUser) return done(null, false)

      return done(null, foundUser.toJSON())
    } catch (error) {
      return done(error, null)
    }
  })
}
