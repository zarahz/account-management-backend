const jwt = require('jsonwebtoken');
const { compare } = require('../util/bcrypt');
const { User } = require('../model');
const { generateSalt, hash } = require('../util/bcrypt');
const config = require('../../config');

const SALT_WORK_FACTOR = 10;

const reduceUser = (user) => ({
  id: user.id,
  gender: user.gender,
  role: user.role,
  firstname: user.firstname,
  lastname: user.lastname,
  username: user.username,
  email: user.email,
  organisation: user.organisation,
  address: user.address,
  city: user.city,
  country: user.country,
  zipCode: user.zipCode,
  fieldOfActivity: user.fieldOfActivity,
  researchInterest: user.researchInterest,
  eventbasedRole: user.eventbasedRole,
});

const createUser = async (userObj, fullUserObject = false) => {
  const newUser = new User(userObj);
  const { username } = newUser;
  const { email } = newUser;
  let exists = null;
  let userN = null;
  let userE = null;
  userN = await User.findOne({ username });
  userE = await User.findOne({ email });
  if (userN !== null) {
    exists = -1;
  }
  if (userE !== null) {
    exists = -2;
  }
  if (exists !== null) { return exists; }
  await newUser.save();
  return (fullUserObject) ? newUser : reduceUser(newUser);
};

const authenticateUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) { return -1; }
  const success = await compare(password, user.password);
  return success ? reduceUser(user) : -2;
};

const updatePassword = async (_id, newPassword) => {
  if (!newPassword) { return 'empty_password'; }
  const user = await User.findOne({ _id });
  if (!user) { return 'no_user_found'; }

  try {
    // generate a random salt number by passing a fix factor
    const salt = await generateSalt(SALT_WORK_FACTOR);
    // use this salt number to create a modified hash
    const encrypted = await hash(newPassword, salt);

    // update password of the user
    const update = { password: encrypted };
    const updated = await User.findOneAndUpdate({ _id }, update);
    if (!updated) { return 'update_failed'; }

    return 'success';
  } catch (error) {
    return 'encryption_failed';
  }
};

const deleteUser = async (username) => {
  const exists = await User.findOne({ username });
  if (!exists) { return null; }

  const deleted = await User.findOneAndDelete({ username });
  if (!deleted) { return null; }

  const success = exists.username.localeCompare(deleted.username);
  return success;
};

const getUser = async (queryObject, fullUserObject = false) => {
  const user = await User.findOne(queryObject);
  if (!user) { return -1; }
  return (fullUserObject) ? user : reduceUser(user);
};

const queryUser = async (searchTerm, attributes = ['firstname', 'lastname', 'username', 'email']) => {
  // Create regex
  // Split searchterm and replace whitespaces with OR
  let regexString = '';
  regexString = searchTerm.split(' ').join('|');
  // modifier ig: g = global (return ALL matches) i = insensitive
  const regex = new RegExp(regexString, 'ig');

  // Create search condition and search in db for each attribute
  const searchCondition = [];
  attributes.forEach((attribute) => {
    searchCondition.push({ [attribute]: regex });
  });
  const users = await User.find({
    $or: searchCondition,
  });
  // return reduced user to secure sensible data
  return users.map((user) => reduceUser(user));
};

const authenticateUserByJWT = async (token) => new Promise((resolve, reject) => {
  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) return reject(err);
    const user = await getUser({ _id: decoded });
    return resolve(user);
  });
});

const checkRole = async (_id, eventID) => {
  const user = await User.findById(_id);
  if (!user) { return -1; }
  let role = -2;
  user.eventbasedRole.forEach((value) => {
    if (value.event === Number(eventID)) {
      role = value.role;
    }
  });
  return role; // event not found
};

const updateUser = async (id, userObj) => {
  const filter = { _id: id };
  const userUpdated = await User.findOneAndUpdate(filter, userObj, { new: true });
  if (!userUpdated) { return -1; }
  return reduceUser(userUpdated);
};

module.exports = {
  createUser,
  deleteUser,
  authenticateUser,
  authenticateUserByJWT,
  getUser,
  updateUser,
  updatePassword,
  checkRole,
  queryUser,
};
