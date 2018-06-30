const User = require('../../models/user')
const { defaultResponse } = require('../common')
const passport = require('passport')
const session = require('express-session')
const passwordHash = require('password-hash')
exports.destroy = (req, res) => {
  if (req.session.user) return req.session.destroy()
}

exports.post = (req, res) => {
  return User.findOne({ email: req.body.email}).lean().exec().then(user => {
    if (!user) {
      return res.status(401).json('invalid credentials')
    }
    if (passwordHash.verify(req.body.password, user.password)) {
      user.email == 'dh.lama@gmail.com' ? user.isAdmin = true : user.isAdmin = false;
      req.session.user = user
      req.session.save()
      return res.status(200).json(user)
    }
    else {
      return res.status(401).json('Wrong password')
    }
  })
}
