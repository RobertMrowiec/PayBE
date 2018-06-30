const mongoose = require('mongoose')
const Schema = mongoose.Schema

let ProjectSchema = new Schema({
  name: {type: String, required: true},
  amount: {type: Number, required: true},
  peoples: {type: Number, default: 0},
  howmany: {type: Number, default: 0},
  old: {type: Boolean, default: false},
  howmanyPotentially: {type: Number, default: 0},
  salaries: {type: Number, default: 0},
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
},{ strict: false, versionKey: false })

module.exports = mongoose.model('Project', ProjectSchema)
