const { Schema, model } = require('mongoose');
const { generateSalt, hash } = require('../util/bcrypt');

const SALT_WORK_FACTOR = 10;

// the user schema and how it is stored in the database
const User = new Schema({
  title: { type: String },
  gender: { type: String },
  firstname: { type: String, required: true, trim: true },
  lastname: { type: String, required: true, trim: true },
  username: {
    type: String, unique: true, required: true, trim: true,
  },
  email: {
    type: String, unique: true, required: true, trim: true,
  },
  password: { type: String, required: true },
  organisation: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String },
  country: { type: String },
  zipCode: { type: Number },
  fieldOfActivity: { type: String, required: true, trim: true },
  researchInterest: { type: Array, required: true }, // predefined in enums
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  securityQuestion: { type: String, required: true }, // predefined in enums
  securityAnswer: { type: String, required: true, trim: true },
  eventbasedRole: [
    {
      role: { type: String },
      event: { type: Number }, // contains id of event
    },
  ],
  // additional fields to be added in future:
  // social media links, avatar image
  // (relation to other users), (payment), (about text)
});

/**
 * Method to encrypt password before a user is saved.
 */
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
