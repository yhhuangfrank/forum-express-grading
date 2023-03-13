// - 引用 jwt 作為身分驗證
const jwt = require('jsonwebtoken')

const userController = {
  signIn: (req, res, next) => {
    // - 若通過 passport 驗證則簽發一組30天效期的 jwt token 並回傳
    // - 且夾帶 req.user 作為 payload (須為一個 plain object)
    try {
      const userData = req.user.toJSON() // - 將 sequelize 包裝的物件轉為簡單的物件
      delete userData.password // - 使用 delete 運算子刪除物件中的屬性
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
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
  }
}

module.exports = userController
