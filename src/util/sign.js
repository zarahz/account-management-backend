const jwt = require('jsonwebtoken');
const config = require('../../config');

/**
 * generates a token and embeds the userid within
 * @param {String} userID
 */
const generateToken = (userID) => jwt.sign(JSON.stringify(userID), config.secret);

/**
 * Validates a given token and checks if the userid contained inside
 * the token matches the requestors id
 *
 * @param {String} token
 * @param {String} userID
 */
const validateToken = async (token, userID) => {
  let isValid = false;
  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      isValid = false;
    } else if (userID === JSON.parse(decoded)) {
      isValid = true;
    }
  });
  return isValid;
};

module.exports = { generateToken, validateToken };
