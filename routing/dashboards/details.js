const User = require('../../models/user')
const Salary = require('../../models/salary')
const Project = require('../../models/project')
const { defaultResponse } = require('../common')
const forEP = require('foreach-promise')
exports.get = (req, res) => {
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  if (req.session.user.isAdmin && req.session.user.isAdmin == true){
    return getAllBySpecificMonth(req, res, firstDay, lastDay)
  }
  else {
     return Salary.find({userId: req.session.user._id, date: {$gt: firstDay, $lt: lastDay}}).lean().exec().then(salaries => {
       sum = 0
       if (salaries.length > 0) {
         forEP(salaries, salary => sum += (salary.amount))
         return res.status(200).json({sum: sum})
       }
       else {
         return res.status(200).json({sum: 0})
       }
     })
  }
}

exports.monthAgo = (req, res) => {
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth() -1 , 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
  return getAllBySpecificMonth(req, res, firstDay, lastDay)
}

exports.twoMonthsAgo = (req, res) => {
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth() -2 , 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth() -1, 0);

  return getAllBySpecificMonth(req, res, firstDay, lastDay)
}

exports.projects = (req, res) => {
  let name
  let userArray = []
  let salaryArray = []
  let allSalariesArray = []
  return Project.findById(req.params.projectId).select('name').lean().exec().then(project => {
    name = project.name
    return User.find({projects: req.params.projectId}).sort('_id').select('name').lean().exec().then(users => {
      forEP(users, user => {
        userArray.push(user.name)
        return Salary.find({userId: user._id, projectId: req.params.projectId, potentially:false }).populate('projectId').select('amount, projectId').lean().exec().then(salaries => {
          if (salaries.length > 0){
            let salarySum = 0
            forEP(salaries, salary => {
              salarySum += salary.amount
            })
            salaryArray.push({'user': user._id, 'salary': salarySum})
           }
          else {
            salaryArray.push({'user': user._id, 'salary': 0})
          }
        }).then(() => {
          return Salary.find({userId: user._id, projectId: req.params.projectId}).lean().exec().then(allSalaries => {
            if (allSalaries.length > 0){
              let allSalarySum = 0
              forEP(allSalaries, salary => {
                allSalarySum += salary.amount
              })
              allSalariesArray.push({'user': user._id, 'salary': allSalarySum})
             }
            else {
              allSalariesArray.push({'user': user._id, 'salary': 0})
            }
          })
        })
      }).then(() => res.json({salary: salaryArray.sort((a,b) => a.user > b.user).map(x => x.salary), users: userArray, name: name, allSalaries: allSalariesArray.sort((a,b) => a.user > b.user).map(x => x.salary)}))
    })
  })
}

exports.projectsActualMonth = defaultResponse(req => {
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return getProjectBySpecificMonth(firstDay, lastDay)
})

exports.projectsMonthAgo = defaultResponse(req => {
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth(), 0);

  return getProjectBySpecificMonth(firstDay, lastDay)
})

exports.projectsTwoMonthsAgo = defaultResponse(req => {
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth() - 2, 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth() - 1, 0);

  return getProjectBySpecificMonth(firstDay, lastDay)
})

function getProjectBySpecificMonth(firstDay, lastDay) {
  return Salary.aggregate()
    .lookup({
      from: 'projects',
      localField: "projectId",
      foreignField: "_id",
      as: "project"
    })
    .match({date: {$gt: firstDay, $lt: lastDay}})
    .group({
      _id: "$projectId",
      name: {$first: "$project.name"},
      count: { $sum: 1 },
      sum: { $sum: "$amount"}
    })
}
function getAllBySpecificMonth(req, res, firstDay, lastDay) {
  let salariesArray = []
  let potentiallySalariesArray = []
  let usersArray = []
  return User.find().sort('_id').lean().exec().then(users => {
    forEP(users, user => {
      usersArray.push(user.name + ' ' + user.surname)
      return Salary.find({userId: user._id, date: {$gt: firstDay, $lt: lastDay}, potentially: false}).lean().exec().then(salaries => {
        let salariesSum = 0
        if (salaries.length == 0) {
          salariesArray.push({'user': user._id, 'salary': 0})
        }
        else {
          forEP(salaries, salary => salariesSum += salary.amount).then(() => salariesArray.push({ 'user': user._id, 'salary': salariesSum}))
        }
      }).then(() => {
        return Salary.find({userId: user._id, date: {$gt: firstDay, $lt: lastDay}}).lean().exec().then(allSalaries => {
          let allSalariesSum = 0
          if (allSalaries.length == 0) {
            potentiallySalariesArray.push({'user': user._id, 'salary': 0})
          }
          else {
            forEP(allSalaries, salary => allSalariesSum += salary.amount).then(() => potentiallySalariesArray.push({ 'user': user._id, 'salary': allSalariesSum}))
          }
        })
      })
    }).then(() => {
      return res.status(200).json({
        imiona: usersArray,
        sumy: salariesArray.sort((a, b) => a.user > b.user).map(x => x.salary),
        potencjalne: potentiallySalariesArray.sort((a, b) => a.user > b.user).map(x => x.salary)
      })
    })
  })
}
