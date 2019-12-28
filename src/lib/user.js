const uuidv4 = require('uuid/v4');

const { compare } = require('../util/bcrypt');
const { User } = require('../model');
const { generateSalt, hash } = require('../util/bcrypt');

const SALT_WORK_FACTOR = 10;

const reduceUser = (user) => ({
  id: user.id,
  token: user.token,
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

const createUser = async (userObj) => {
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
  newUser.token = uuidv4();
  await newUser.save();
  return reduceUser(newUser);
};

const authenticateUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) { return -1; }
  const success = await compare(password, user.password);
  return success ? reduceUser(user) : -2;
};

const updatePassword = async (_id, newPassword) => {
  const user = await User.findOne({ _id });
  if (!user) { return -1; }
  if (!newPassword) { return -2; }

  try {
    // generate a random salt number by passing a fix factor
    const salt = await generateSalt(SALT_WORK_FACTOR);
    // use this salt number to create a modified hash
    const encrypted = await hash(newPassword, salt);

    // update password the user
    const filter = { _id };
    const update = { password: encrypted };
    const updated = await User.findOneAndUpdate(filter, update);
    if (!updated) { return -3; }

    return 0;
  } catch (error) {
    return -4;
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

const getUserInfoByID = async (_id) => {
  if (_id.length < 24 || _id.length > 24) { return -1; }
  const user = await User.findById(_id);
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

const getUserByID = async (_id) => {
  if (_id.length < 24 || _id.length > 24) { return -1; }
  const user = await User.findById(_id);
  if (!user) { return -2; }

  return user;
};

const checkRole = async (_id, eventID) => {
  if (_id.length < 24 || _id.length > 24) { return -1; }
  const user = await User.findById(_id);
  if (!user) { return -2; }
  let role = -3;
  user.eventbasedRole.forEach((value) => {
    if (value.event === Number(eventID)) {
      role = value.role;
    }
  });
  return role; // event not found
};

const updateUser = async (id, userObj) => {
  const filter = { _id: id };
  const userInfo = {
    role: userObj.role,
    firstname: userObj.firstname,
    lastname: userObj.lastname,
    username: userObj.username,
    email: userObj.email,
    fieldOfActivity: userObj.fieldOfActivity,
    researchInterest: userObj.researchInterest,
    eventbasedRole: userObj.eventbasedRole,
  };
  const userUpdated = await User.findOneAndUpdate(filter, userInfo, { new: true });
  if (!userUpdated) { return -1; }

  return userUpdated;
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
