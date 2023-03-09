const catchError = require('../utils/catchError');
const EmailCode = require('../models/EmailCode');
const User = require('./user.controllers')

const create = catchError(async (req, res) => {

  const result = await EmailCode.create({
    code: require('crypto').randomBytes(32).toString("hex"),
    userId
  });
  return res.json(result)
});

module.exports = {
  create
}