const uuidv4 = require('uuid/v4');

const { compare } = require('../util/bcrypt');
const { User } = require('../model');
const { generateSalt, hash } = require('../util/bcrypt');

const SALT_WORK_FACTOR = 10;


const createUser = async (userObj) => {
  const newUser = new User(userObj);
  const username = newUser.username;
  const email = newUser.email;
  let exists = null;
  let userN = null;
  let userE = null;
  userN = await User.findOne({ username });
  console.log(userN);
  userE = await User.findOne({ email });
  console.log(userE);
  if (userN !== null) {
    exists = -1;
  }
  if (userE !== null) {
    exists = -2;
  }
  if (exists !== null) { return exists; }
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

const getUserInfoByID = async (userID) => {
  if (userID.length < 24 || userID.length > 24) { return -1; }
  const user = await User.findById(userID);
  if (!user) { return -2; }

  const userInfo = {
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    email: user.email,
    fieldOfActivity: user.fieldOfActivity,
    researchInterest: user.researchInterest,
  };
  return userInfo;
};

// queryobject contains an attribute and its value i.e. username: 'aCoOolUser'
const getUser = async (queryObject) => User.findOne(queryObject);

const getUserByID = async (id) => {
  if (id.length < 24 || id.length > 24) { return -1; }
  const user = await User.findById(id);
  if (!user) { return -2; }

  return user;
};

// to do
const checkRole = async (userID, eventID) => {
  if (userID.length < 24 || userID.length > 24) { return -1; }
  const user = await User.findById(userID);
  if (!user) { return -2; }
  let role = -3;
  user.eventbasedRole.forEach((value) => {
    if (value.event === Number(eventID)) {
      role = value.role;
    }
  });
  return role; // event not found
};

const updateUser = async (userId, userObj) => {
  const user = await User.findOneAndUpdate(userId, userObj, { new: true });
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
  getUserInfoByID,
  checkRole,
};
