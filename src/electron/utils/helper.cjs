const bcrypt = require('bcrypt');

function hashPassword(plainText) {
  const saltRound = 10;
  const salt = bcrypt.genSaltSync(saltRound);
  const hash = bcrypt.hashSync(plainText, salt);
  return hash;
}

module.exports = {
  hashPassword,
}