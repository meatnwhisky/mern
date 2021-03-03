const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')
const User = require('../models/User')
const router = Router()

// /api/auth/register
router.post(
  '/register',
  //middleware
  [
    check('email', 'email address is incorrect').isEmail(),
    check('password', 'password minimum length is 6 simbols').isLength({ min: 6 })//isLength method acceps object min
  ],
  async (req, res) => {

    try {
      const validationErrors = validationResult(req)
      if (!validationErrors.isEmpty()) {
        //when return and when just res?
        return res.status(400).json({
          errors: validationErrors.array(),
          message: 'registration failed'
        })

      }
      const { email, password } = req.body

      const candidate = await User.findOne({ email }) //email is object

      if (candidate) {
        return res.status(400).json({ message: 'user with this email already exist' })
      }
      //hash his password
      const hashedPassword = await bcrypt.hash(password, 12)
      const user = new User({ email, password: hashedPassword })

      await user.save()

      res.status(201).json({ message: 'user was successfully created!' })

    } catch (e) {
      res.status(500).json({
        message: 'Oops...please try again later'
      })
    }
  })
router.post(
  '/login',
  [
    check('email', 'insert correct email').normalizeEmail().isEmail(),
    check('password', 'insert password').exists()
  ],
  async (req, res) => {
    try {
      const validationErrors = validationResult(req)
      if (!validationErrors.isEmpty()) {
        //when return and when just res?
        return res.status(400).json({
          errors: validationErrors.array(),
          message: 'login failed'
        })
      }
      const { email, password } = req.body
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({
          message: 'user does not exisit'
        })
      }
      //compare hashed passwords
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({
          message: 'email or password is incorrect'
        })
      }
      const token = jwt.sign({ userId: user.id }, config.get('jwtSecret'), { expiresIn: '1h' })
      //todo:

      res.json({ token, userId: user.id })

    } catch (e) {
      res.status(500).json({
        message: 'Oops...something went wrong try again later'
      })
    }
  })
module.exports = router