module.exports = async (req, res, next) => {
    const user = req.session.user
    if (!user || typeof user !== 'object') {
      return res.redirect(`https://reactjs-manage-team.firebaseapp.com/login`)
    }
    else {
      return next()
    }
}
