const { Schema, model } = require('mongoose');
const { generateSalt, hash } = require('../util/bcrypt');

const SALT_WORK_FACTOR = 10;

// the user schema and how it is stored in the database
const User = new Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

// encrypt password before saving
User.pre('save', async function callback(next) {
  const user = this;

  if (!user.isModified('password')) return next();

  try {
    // generate a random salt number by passing a fix factor
    const salt = await generateSalt(SALT_WORK_FACTOR);
    // use this salt number to create a modified hash
    // -> ensures security if database is hacked
    const encrypted = await hash(user.password, salt);

    // use this encrypted password for storing and user validation
    user.password = encrypted;
    return next();
  } catch (error) {
    return next(error);
  }
});


module.exports = model('user', User);
