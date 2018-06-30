const User = require('../../models/user')
const Salary = require('../../models/salary')
const { defaultResponse } = require('../common')
const forEP = require('foreach-promise')
exports.get = (req, res) => {
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  if (req.session.user.isAdmin && req.session.user.isAdmin == true){
    let salariesArray = []
    let potentiallySalariesArray = []
    let usersArray = []
    return User.find().sort('_id').lean().exec().then(users => {
      forEP(users, user => {
        usersArray.push(user.name)
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

exports.projects = (req, res) => {
  let userArray = []
  let salaryArray = []
  let allSalariesArray = []

  return User.find({projects: req.params.projectId}).sort('_id').select('name').lean().exec().then(users => {
    forEP(users, user => {
      userArray.push(user.name)
      return Salary.find({userId: user._id, projectId: req.params.projectId, potentially:false }).select('amount').lean().exec().then(salaries => {
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
        return Salary.find({userId: user._id, projectId: req.params.projectId}).select('amount').lean().exec().then(allSalaries => {
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
    }).then(() => res.json({salary: salaryArray.sort((a,b) => a.user > b.user).map(x => x.salary), users: userArray, allSalaries: allSalariesArray.sort((a,b) => a.user > b.user).map(x => x.salary)}))
  })
}