const mongoose = require('mongoose')
const Schema = mongoose.Schema

let UserSchema = new Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
  isAdmin: {type: Boolean, default: false},
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project'}],
  name: {type: String, required: true},
  surname: {type: String, required: true},
  sum: {type: Number, default: 0}
},{ strict: false, versionKey: false })

module.exports = mongoose.model('User', UserSchema)
