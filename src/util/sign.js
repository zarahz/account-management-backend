const jwt = require('jsonwebtoken');
const config = require('../../config');

const generateToken = (userID) => jwt.sign(JSON.stringify(userID), config.secret);

const validateToken = async (token) => {
  let isValid = false;
  jwt.verify(token, config.secret, async (err) => {
    if (err) {
      isValid = false;
    } else {
      isValid = true;
    }
  });
  return isValid;
};

module.exports = { generateToken, validateToken };
