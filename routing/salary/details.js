const Salary = require('../../models/salary')
const Project = require('../../models/project')
const User = require('../../models/user')
const { defaultResponse } = require('../common')
const moment = require('moment')
const server = require('../../emails/email')

exports.get = defaultResponse(async req => {
  if (req.session.user.isAdmin == true) return {
    salaries: await Salary.find().populate('projectId').populate('userId').sort('-date').lean().exec(),
    isAdmin: true,
    logged: req.session.user
  }
  else return {
    salaries: await Salary.find({userId: req.session.user._id}).populate('projectId').populate('userId').sort('-date').lean().exec(),
    isAdmin: false,
    logged: req.session.user
  }
})

exports.projectId = defaultResponse(req => Salary.find({projectId: req.params.projectId}).populate('projectId').populate('userId').sort('-date').lean().exec().then(salaries => { return {salaries: salaries, logged: req.session.user}}));

exports.userId = defaultResponse(req => Salary.find({userId: req.params.userId}).populate('projectId').populate('userId').sort('-date').exec())

exports.date = defaultResponse(async req => {

  if (req.params.date == 7) {
    betweenDate = await moment(new Date()).startOf('week')
  }
  else if (req.params.date == 30) {
    betweenDate = await moment(new Date()).startOf('month')
  }
  else if (req.params.date == 365) {
    betweenDate = await moment(new Date()).startOf('year')
  }
  else if (req.params.date == 0) {
    betweenDate = '01/01/2018'
  }
  return Salary.find({$and: [{userId: req.params.userId}, {date: {
    $gte: betweenDate
  }}]}).populate('projectId').populate('userId').sort('-date').exec()
})

exports.info = defaultResponse(req => {
  return Salary.findById(req.params.id).populate('projectId').populate('userId').exec()
})

exports.add = (req, res) => {
  return new Salary(req.body).save().then(() => {
    if (req.body.potentially === true) {
      return Project.findById(req.body.projectId).exec().then(founded => {
        const update = {
          $inc: {salaries: 1},
          $set: {howmanyPotentially: founded.howmanyPotentially - req.body.amount}
        }
        return Project.findByIdAndUpdate(req.body.projectId, update, {new:true}).exec()
      })
    } else {
      return Project.findById(req.body.projectId).exec().then(founded => {
        const update = {
          $inc: {salaries: 1},
          $set: {howmany: founded.howmany - req.body.amount}
        }
        return Project.findByIdAndUpdate(req.body.projectId, update, {new:true}).exec()
      })
    }
  }).then(() => res.status(200).json('Done'))
}

exports.delete = defaultResponse(req => {
  return Salary.findById(req.params.id).lean().exec().then(salary => {
    if (salary.potentially === true){
      return Project.findByIdAndUpdate(salary.projectId, {$inc: {howmanyPotentially: salary.amount}}, {new:true}).exec()
    } else {
      return Project.findByIdAndUpdate(salary.projectId, {$inc: {howmany: salary.amount}}, {new:true}).exec()
    }
  }).then(() => {
    return Salary.findByIdAndRemove(req.params.id).exec()
  })
})

exports.update = defaultResponse(req => {
  return Salary.findByIdAndUpdate(req.params.id, req.body).lean().exec().then(salary => {
    return Project.findById(req.body.projectId).lean().exec().then(project => {
      if (salary.potentially == true && salary.potentially != req.body.potentially){
        project.howmany = project.howmany - salary.amount
        project.howmanyPotentially = project.howmanyPotentially + salary.amount
        return Project.findByIdAndUpdate(req.body.projectId, project, {new:true}).lean().exec().then(project => {
          return User.findById(salary.userId).lean().exec().then(user => {
            return server.sendmail(user.email, 'Zmiana statusu wypłaty', `Twoja wypłata w projekcie: ${project.name} w kwocie: ${req.body.amount} zł została potwierdzona`)
          }).then(() => salary)
        }).catch(err => console.log)
      }
      else if (salary.potentially == false && salary.potentially != req.body.potentially){
        project.howmany = project.howmany + salary.amount
        project.howmanyPotentially = project.howmanyPotentially - salary.amount
        return Project.findByIdAndUpdate(req.body.projectId, project, {new:true}).exec()
      }
      else if (salary.amount != req.body.amount) {
        if (salary.potentially === true) {
          project.howmanyPotentially += salary.amount - req.body.amount
        } else {
          project.howmany += salary.amount - req.body.amount
        }
        return Project.findByIdAndUpdate(req.body.projectId, project).exec()
      }
      else return salary
    })
  }).catch(err => console.log)
})
