const express = require('express')
const router = express.Router()
const dashboard = require('./details')

router.get('/salaries', dashboard.get)
      .get('/projects/:projectId', dashboard.projects)

module.exports = router
