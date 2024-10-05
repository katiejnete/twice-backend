const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");

/** return signed JWT from user data. */

function createToken(user) {
  const payload = {username: user.username, userId: user.id}
  const token = jwt.sign(payload, SECRET_KEY);
  return token;
}

module.exports = { createToken };
