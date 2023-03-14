// - 運行 passport 設定
const passport = require('passport')

// - 封裝 api 使用的 JWT 驗證 middleware
const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) { return res.status(401).json({ status: 'error', message: 'unauthorized' }) }
    next()
  })(req, res, next)
}
const authenticatedAdmin = (req, res, next) => {
  // - require passport 後 user 資料會存入 req.user
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