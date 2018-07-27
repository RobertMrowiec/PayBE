const express = require('express')
const router = express.Router()
const dashboard = require('./details')

router.get('/salaries', dashboard.get)
      .get('/salaries/monthAgo', dashboard.monthAgo)
      .get('/salaries/twoMonthsAgo', dashboard.twoMonthsAgo)
      .get('/projects/:projectId', dashboard.projects)

module.exports = router
