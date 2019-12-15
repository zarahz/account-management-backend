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

const updatePassword = async (userID, newPassword) => {
  const user = await User.findOne({ userID });
  if (!user) { return null; }

  const filter = { userID };
  const update = { password: newPassword };
  const updated = await User.findOneAndUpdate(filter, update);
  console.log(user.password);
  if (!updated) { return -1; }

  return 0;
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
  const user = await getUserByID(userId);
  user.title = userObj.title;
  user.gender = userObj.gender;
  user.firstname = userObj.firstname;
  user.lastname = userObj.lastname;
  user.username = userObj.username;
  user.email = userObj.email;
  user.password = userObj.password;
  user.organisation = userObj.organisation;
  user.address = userObj.address;
  user.city = userObj.city;
  user.country = userObj.country;
  user.zipCode = userObj.zipCode;
  user.fieldOfActivity = userObj.fieldOfActivity;
  user.researchInterest = userObj.researchInterest;
  user.role = userObj.role;
  user.securityQuestion = userObj.securityQuestion;
  user.securityAnswer = userObj.securityAnswer;
  user.eventbasedRole = userObj.eventbasedRole;
  await user.save();
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
