const { compare } = require('../util/bcrypt');
const { User } = require('../models');

const createUser = async (userObj) => {
  const newUser = new User(userObj);
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

module.exports = {
  createUser,
  deleteUser,
  authenticateUser,
};
