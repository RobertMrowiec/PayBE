const Project = require('../../models/project')
const User = require('../../models/user')
const { defaultResponse } = require('../common')
const forEP = require('foreach-promise');

exports.get = defaultResponse(async req => {
  if (req.query && req.query.old) {
    return {
      projects: await Project.find({old: true}).lean().exec(),
      logged: req.session.user
    }
  }
  if (req.session.user.isAdmin === true){
    return Project.find({old: false}).exec().then(async projects => {
      forEP(projects, async project => {
        project.peoples = await project.users.length
      })
      return {projects: projects, logged: req.session.user}
    })
  }
  else return Project.find({old: false, users: req.session.user._id}).exec().then(async projects => {
    if(projects.length > 0){
      forEP(projects, async project => {
        project.peoples = await project.users.length
      })
      return {projects: projects, logged: req.session.user}
    }
    else return {projects: [], logged: req.session.user}
  })
})

exports.user = defaultResponse(req => Project.find({users: req.params.userId}).lean().exec())

exports.info = defaultResponse(req => {
  return Project.findById(req.params.id).exec()
})

exports.add = defaultResponse(req => {
  req.body.howmany = Number(req.body.amount)
  req.body.peoples = req.body.users.length
  req.body.howmanyPotentially = Number(req.body.amount)

  return new Project(req.body).save().then(saved => {
    req.body.users.forEach(async user => {
      await User.findByIdAndUpdate(user,  { $push: { projects: saved._id }}, {new: true})
    })
    return saved
  })
})

exports.delete = defaultResponse(req => {
  return Project.findByIdAndRemove(req.params.id).exec()
})

exports.update = defaultResponse(req => {
  req.body.peoples = req.body.users.length
  return Project.findById(req.params.id).exec().then(found => {
    if (req.body.amount !== found.amount) req.body.howmany = req.body.amount - (found.amount - found.howmany)
    return console.log('I`ve got an update object');
  }).then(() => {
    return Project.findByIdAndUpdate(req.params.id, req.body).exec().then(saved => {
      if (saved.users && saved.users.length > 0){
        return forEP(saved.users, userBefore => User.findById(userBefore).lean().exec().then(user => {
          user.projects = user.projects.filter(x => x != req.params.id)
          return User.findByIdAndUpdate(userBefore, user).exec()
        }))
      }
      return req.body
    }).then((saved) => {
      if (req.body.users && req.body.users.length > 0){
          return req.body.users.forEach(async user => {
          await User.findById(user).lean().exec().then(user => {
            if (user.projects) {
              user.projects = user.projects.filter(x => x.toString() != req.params.id.toString())
              user.projects.push(req.params.id)
              return User.findByIdAndUpdate(user._id, {projects: user.projects}).exec()
            }
            else {
              user.projects = [req.params.id]
              return User.findByIdAndUpdate(user._id, {$set: {projects: user.projects}}).exec()
            }
          })
        })
      }
      else {
        return saved
      }
    })
  })
})
