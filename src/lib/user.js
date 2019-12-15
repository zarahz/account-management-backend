const uuidv4 = require('uuid/v4');

const { compare } = require('../util/bcrypt');
const { User } = require('../model');


const create = async (userObj) => {
  const newUser = new User(userObj);
  newUser.token = uuidv4();
  await newUser.save();
  return newUser;
};

const authenticate = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) { return null; }
  const success = await compare(password, user.password);
  return success ? user : null;
};

const deleteUser = () => {
  // TODO: Implement
};

// queryobject contains an attribute and its value i.e. username: 'aCoOolUser'
const get = async (queryObject) => User.findOne(queryObject);

const getByID = async (id) => User.findById(id);

module.exports = {
  create,
  deleteUser,
  authenticate,
  get,
  getByID,
};
