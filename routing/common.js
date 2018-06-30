module.exports.defaultResponse = defaultResponse
function defaultResponse(func) {
    return (req, res) => func(req, res)
        .then(x => res.status(200).json(x))
        .catch(err => res.status(400).json({ message: err }))
}