require('./app')('mongodb://Robert:qwe123@ds213759.mlab.com:13759/heroku_9j8c4dxj').then(app => {
    console.log("Server is running on port: 8030")
    app.listen(process.env.PORT || 8030)
})
