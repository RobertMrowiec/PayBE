const email = require('emailjs')
const server = email.server.connect({
  user: "robert@surprise.design",
  password: "qwe123",
  host: "mail.surprise.design",
  tls: true
})

exports.sendmail = function (getTo, getSubject, getData) {
  return new Promise(function (resolve, reject) {
    server.send({
      text: "",
      from: "<ManageApp>",
      to: getTo,
      subject: getSubject,
      attachment: [{ data: getData, alternative: true }]
    }, function (errors, sended) {
      if (errors) reject(errors)

      resolve(true)
    })
  })
}
