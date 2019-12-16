const uuidv4 = require('uuid/v4');

const { compare } = require('../util/bcrypt');
const { User } = require('../model');
const { generateSalt, hash } = require('../util/bcrypt');

const SALT_WORK_FACTOR = 10;


const createUser = async (userObj) => {
  const newUser = new User(userObj);
  newUser.token = uuidv4();
  await newUser.save();
  return newUser;
};

const authenticateUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) { return null; }
  const success = await compare(password, user.password);
  return success ? user : null;
};

const updatePassword = async (userID, newPassword) => {
  const user = await User.findOne({ userID });
  if (!user) { return null; }
  if (!newPassword) { return -1; }

  try {
    // generate a random salt number by passing a fix factor
    const salt = await generateSalt(SALT_WORK_FACTOR);
    // use this salt number to create a modified hash
    const encrypted = await hash(newPassword, salt);

    // update password the user
    const filter = { userID };
    const update = { password: encrypted };
    const updated = await User.findOneAndUpdate(filter, update);
    if (!updated) { return -2; }

    return 0;
  } catch (error) {
    return -3;
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

// queryobject contains an attribute and its value i.e. username: 'aCoOolUser'
const getUser = async (queryObject) => User.findOne(queryObject);

const getUserByID = async (id) => User.findById(id);

const updateUser = async (userId, userObj) => {
  const user = await User.findOneAndUpdate(userId, userObj, { new: true });
  console.log(user);
  return user;
};

module.exports = {
  createUser,
  deleteUser,
  authenticateUser,
  getUser,
  getUserByID,
  updateUser,
  updatePassword,
};
