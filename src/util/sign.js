const jwt = require('jsonwebtoken');
const config = require('../../config');

const generateToken = (userID) => jwt.sign(JSON.stringify(userID), config.secret);

const validateToken = async (token, userID) => {
  let isValid = false;
  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      isValid = false;
    } else if (userID === JSON.parse(decoded)) {
      console.log(userID);
      console.log(decoded);
      isValid = true;
    }
  });
  return isValid;
};

module.exports = { generateToken, validateToken };
