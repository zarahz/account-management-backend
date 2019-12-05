const bcrypt = require('bcrypt');

const generateSalt = async (factor) => new Promise((resolve, reject) => {
  bcrypt.genSalt(factor, (err, salt) => {
    if (err) {
      return reject(err);
    }
    return resolve(salt);
  });
});

const hash = async (data, salt) => new Promise((resolve, reject) => {
  bcrypt.hash(data, salt, (err, encrypted) => {
    if (err) {
      return reject(err);
    }
    return resolve(encrypted);
  });
});

/**
 * bcrypt can help athenticate the user by taking the OG user password together with the hashed
 * password. What bcrypt does is it reconstructs the generated salt for this password and generates
 * a new modified hash (create hash of pw and add the salt ;) ). Afterwards the new hash is compared
 * with the existing hash, if they match the user is autherized and can login
 */
const compare = async (password, existingHash) => new Promise((resolve, reject) => {
  bcrypt.compare(password, existingHash, (err, authentificationSuccess) => {
    if (err) {
      return reject(err);
    }
    return resolve(authentificationSuccess);
  });
});

module.exports = {
  generateSalt,
  hash,
  compare,
};
