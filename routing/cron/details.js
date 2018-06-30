const Project = require('../../models/project')
const Salary = require('../../models/salary')
const User = require('../../models/user')
const { defaultResponse } = require('../common')

exports.projects = defaultResponse(req => Project.find({monthly: true}).lean().exec().then(projects => {
  projects.forEach(project => {
    Project.findByIdAndUpdate(project._id, {howmany: project.amount, howmanyPotentially: project.amount}, {new: true}).exec()
  })
  return 'done'
}))

exports.salaries = defaultResponse(req => {
  return Salary.find({potentially: true}).populate('projectId').populate('userId').lean().exec().then(salaries => {
    salaries.forEach(salary => {
      if (salary.selectedDate) {
        if (Date.now() > salary.selectedDate) {
         server.sendmail('dh.lama@gmail.com', 'Termin potencjalnej wypłaty', `
         Dzisiaj minął termin wypłaty potencjalnej:
         <p> Projekt: ${salary.projectId.name} </p>
         <p> Kwota: ${salary.amount} PLN </p>
         <p> Programista: ${salary.userId.name} ${salary.userId.surname} </p>
         `)
       }
     } else {
       console.log('nie ma');
     }
    })
    return 'done'
  })
})
