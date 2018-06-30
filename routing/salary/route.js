const express = require('express')
const router = express.Router()
const salary = require('./details')

router
    .get('/', salary.get)
    .get('/:id', salary.info)
    .get('/projects/:projectId', salary.projectId)
    .get('/user/:userId', salary.userId)
    .get('/user/:userId/date/:date', salary.date)
    .post('/', salary.add)
    .delete('/:id', salary.delete)
    .put('/:id', salary.update)

module.exports = router
