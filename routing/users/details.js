const User = require('../../models/user')
const Project = require('../../models/project')
const Salary = require('../../models/salary')
const { defaultResponse } = require('../common')
const passwordHash = require('password-hash')

exports.get = defaultResponse(async req => {
  return {
    users: await User.find().populate('projects').exec(),
    logged: req.session.user
  }
})

exports.projects = defaultResponse(req => User.find({projects: req.params.projectId}).lean().exec())

exports.info = defaultResponse(req => {
  return User.findById(req.params.id).populate('projects').exec()
})

exports.add = defaultResponse(async req => {
  if (req.body.email == 'dh.lama@gmail.com' || req.body.email == 'michal@surprise.design') req.body.isAdmin = true
  req.body.password = passwordHash.generate(req.body.password);
  return new User(req.body).save()
})

exports.update = defaultResponse(async req => {
  return User.findById(req.params.id).lean().exec().then(user => {
    if (req.body.password && !passwordHash.verify(req.body.password, user.password)){
      req.body.password = passwordHash.generate(req.body.password);
      return User.findByIdAndUpdate(req.params.id, req.body, {new: true}).exec()
    }
    return User.findByIdAndUpdate(req.params.id, req.body, {new: true}).exec()
  })
})

exports.delete = defaultResponse(req => {
  if (req.params.id.toString() == req.session.user._id.toString()){
    return 'You cannot delete yourself'
  }
  return Salary.find({userId: req.params.id}).lean().exec().then(async salaries => {
    await salaries.forEach(salary => {
      Salary.findByIdAndRemove(salary._id).exec()
    })
  }).then(() => {
    return User.findByIdAndRemove(req.params.id).exec()
  })
})

exports.deleteProject = defaultResponse(async req => {
  return User.findById(req.params.userId).lean().exec().then(async user => {
    user.projects = await user.projects.filter(x => x != req.params.projectId)
    return User.findByIdAndUpdate(req.params.userId, user, {new: true}).exec().then(() => {
      return Project.findById(req.params.projectId).lean().exec().then(async project => {
        project.users = await project.users.filter(x => x != req.params.userId)
        return Project.findByIdAndUpdate(req.params.projectId, project, {new: true}).exec()
      })
    })
  })
})
