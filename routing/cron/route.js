const express = require('express')
const router = express.Router()
const cron = require('./details')

router
    .get('/projects', cron.projects)
    .get('/salaries', cron.salaries)

module.exports = router
