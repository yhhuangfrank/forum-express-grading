// - 運行 passport 設定
const passport = require('passport')

// - 封裝 api 使用的 JWT 驗證 middleware
const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ status: 'error', message: 'unauthorized' })
    }
    // - 因有在 middleware 中使用 callback function
    // - 故需自行將 user 資料放入 req 中
    req.user = user
    next()
  })(req, res, next)
}
const authenticatedAdmin = (req, res, next) => {
  // - 從 req.user 取得 user 資料
  if (req.user && req.user.isAdmin) {
    return next()
  }
  return res
    .status(403) // - 標明為未認證 (Forbidden)
    .json({ status: 'error', message: 'permission denied' })
}

module.exports = {
  authenticated,
  authenticatedAdmin
}
