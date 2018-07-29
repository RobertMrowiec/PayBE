const express = require('express')
const router = express.Router()
const dashboard = require('./details')

router.get('/salaries', dashboard.get)
      .get('/salaries/months/one', dashboard.monthAgo)
      .get('/salaries/months/two', dashboard.twoMonthsAgo)
      .get('/projects', dashboard.projectsActualMonth)
      .get('/projects/months/one', dashboard.projectsMonthAgo)
      .get('/projects/months/two', dashboard.projectsTwoMonthsAgo)
      .get('/salaries/potentially', dashboard.salariesActualMonthPotentially)
      .get('/salaries/potentially/months/one', dashboard.salariesMonthAgoPotentially)
      .get('/salaries/potentially/months/two', dashboard.salariesTwoMonthsAgoPotentially)
      .get('/person', dashboard.person)
      .get('/person/months/one', dashboard.personMonthAgo)
      .get('/person/months/two', dashboard.personTwoMonthsAgo)
      .get('/projects/:projectId', dashboard.projects);

module.exports = router;
