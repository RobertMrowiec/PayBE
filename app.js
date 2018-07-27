const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const passport = require('passport-http-bearer')
const session = require('express-session')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session({
  secret: 'testest',
  path:'/',
  resave: false,
  saveUninitialized: true,
  cookie: {httpOnly: false}
}))

mongoose.Promise = Promise

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000', 'https://reactjs-manage-team.firebaseapp.com', 'http://pay.surprise.design']
app.use(require('surprise-cors')(allowedOrigins))
app.use('/api', require('./auth'))
app.use('/api/dashboards', require('./routing/dashboards/route'))
app.use('/api/users', require('./routing/users/route'))
app.use('/api/projects', require('./routing/projects/route'))
app.use('/api/salaries', require('./routing/salary/route'))
app.use('/login', require('./routing/login/route'))
app.use('/cron', require('./routing/cron/route'))
module.exports = (dbUrl) => {
  return mongoose.connect(process.env.MONGODB_URI || dbUrl, {useNewUrlParser: true}).then(x => {
    return app
  })
};
