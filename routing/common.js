module.exports.defaultResponse = defaultResponse
function defaultResponse(func) {
    return (req, res) => func(req, res)
        .then(x => res.status(200).json(x))
        .catch(err => res.status(400).json({ message: err }))
}

module.exports.multiFilter = multiFilter
function multiFilter(body) {
  let result = Object.assign({}, body)
  if (body.startMonth >= 0 && body.endMonth){
    result.date = {$gt: new Date(2018, Number(body.startMonth), 1), $lt: new Date(2018, body.endMonth + 1, 1)}
    delete result.startMonth
    delete result.endMonth
  }
  return result
}
