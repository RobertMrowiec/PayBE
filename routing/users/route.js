const express = require('express')
const router = express.Router()
const user = require('./details')

router
    .get('/', user.get)
    .get('/projects/:projectId', user.projects)
    .get('/:id', user.info)
    .post('/', user.add)
    .delete('/:id', user.delete)
    .delete('/:userId/projects/:projectId', user.deleteProject)
    .put('/:id', user.update)

module.exports = router
