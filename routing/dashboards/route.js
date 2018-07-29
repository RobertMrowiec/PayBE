const express = require('express')
const router = express.Router()
const dashboard = require('./details')

router.get('/salaries', dashboard.get)
      .get('/salaries/months/one', dashboard.monthAgo)
      .get('/salaries/months/two', dashboard.twoMonthsAgo)
      .get('/projects', dashboard.projectsActualMonth)
      .get('/projects/months/one', dashboard.projectsMonthAgo)
      .get('/projects/months/two', dashboard.projectsTwoMonthsAgo)
      .get('/projects/potentially', dashboard.projectsActualMonth)
      .get('/projects/potentially/months/one', dashboard.projectsMonthAgo)
      .get('/projects/potentially/months/two', dashboard.projectsTwoMonthsAgo)
      .get('/projects/:projectId', dashboard.projects);

module.exports = router;
