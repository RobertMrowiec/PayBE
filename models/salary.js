const mongoose = require('mongoose')
const Schema = mongoose.Schema

let SalarySchema = new Schema({
  date: {type: Date, default: Date.now()},
  amount: {type: Number, required: true},
  userId: { type: Schema.Types.ObjectId, ref: 'User'},
  potentially: { type: Boolean, default: false },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null},
  title: String
},{ strict: false, versionKey: false })

module.exports = mongoose.model('Salary', SalarySchema)
