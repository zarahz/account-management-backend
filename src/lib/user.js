const uuidv4 = require('uuid/v4');

const { compare } = require('../util/bcrypt');
const { User } = require('../model');


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

const deleteUser = () => {
  // TODO: Implement
};

// queryobject contains an attribute and its value i.e. username: 'aCoOolUser'
const getUser = async (queryObject) => User.findOne(queryObject);

const getUserByID = async (id) => User.findById(id);

module.exports = {
  createUser,
  deleteUser,
  authenticateUser,
  getUser,
  getUserByID,
};
