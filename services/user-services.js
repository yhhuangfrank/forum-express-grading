const { User } = require('../models')
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
  }
}

module.exports = userServices
