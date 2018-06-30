const express = require('express')
const router = express.Router()
const login = require('./details')

router
    .get('/logout', login.destroy)
    .post('/', login.post)

module.exports = router
