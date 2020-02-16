const jwt = require('jsonwebtoken');
const { compare } = require('../util/bcrypt');
const { User } = require('../model');
const { generateSalt, hash } = require('../util/bcrypt');
const config = require('../../config');

const SALT_WORK_FACTOR = 10;
/**
 * This method creates a new userobject with fever attributes so the sensible data are kept
 * save (i.e. password and security answer). The full userobject is only handed over to the
 * frontend on crutial points.
 *
 * @param {*} user
 */
const reduceUser = (user) => ({
  id: user.id,
  title: user.title,
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

/**
 * Gets ONE database user through a queryObject containing attributes and
 * the corresponding filter values. Returns the first matching userobject.
 * i.e. {firstname: 'admin', ...}
 * @param {*} queryObject
 * @param {Boolean} fullUserObject decides wether the complete
 *                                 userobject is returned
 */
const getUser = async (queryObject, fullUserObject = false) => {
  const user = await User.findOne(queryObject);
  if (!user) { return -1; } // error code -1 is returned for no user found
  return (fullUserObject) ? user : reduceUser(user);
};

/**
 * The username and email values are unique. This Method checks those two attribute values
 * and gives the user feedback whether he/she can use his/her set username or email.
 *
 * Returns -1 if the username is already taken, -2 if the email is already registerd
 * or null if the user can use the username and email.
 *
 * @param {String} username that the user wants to have
 * @param {String} email of the user
 */
const checkUniqueFields = async (username, email) => {
  let exists = null;
  let usernameDB = null;
  let emailDB = null;
  // query the values
  usernameDB = await User.findOne({ username });
  emailDB = await User.findOne({ email });
  if (usernameDB !== null) {
    exists = -1; // error code for username taken
  }
  if (emailDB !== null) {
    exists = -2; // error code for email taken
  }

  // if the username or email exists in the database the method returns the error value
  if (exists !== null) { return exists; }
  return null;
};

/**
 * Check if a username or email already exists in the database but ignore the values if
 * the userid matches the parameter id. This is used to update a user without conflicts if the
 * username and/or email doesn't change. If the attributes changes this method also returns
 * error codes to give feedback whether a value is already taken.
 *
 * @param {String} username
 * @param {String} email
 * @param {String} id
 */
const checkUniqueFieldsByID = async (username, email, id) => {
  let exists = null;
  // if a user exists in the database with the given username or email
  // check if the ids match
  // if not then the user is trying to update a unique field with a taken value
  if (username) {
    const dbUserWithUsername = await getUser({ username });
    if (dbUserWithUsername !== -1 && dbUserWithUsername.id !== id) {
      exists = -1;
    }
  }
  if (email) {
    const dbUserWithEmail = await getUser({ email });
    if (dbUserWithEmail !== -1 && dbUserWithEmail.id !== id) {
      exists = -2;
    }
  }
  // returns -1 if the username is taken and -2 for the email or null
  // if the provided values can be used
  return exists;
};

/**
 * Creates a new Database entry for the user.
 * @param {*} userObj
 * @param {Boolean} fullUserObject decides wether the complete
 *                                 userobject is returned (needed for tests)
 */
const createUser = async (userObj, fullUserObject = false) => {
  const newUser = new User(userObj);
  const { username } = newUser;
  const { email } = newUser;
  // return error codes -1 or -2 if a unique attribute is already in the database
  const alreadyExists = await checkUniqueFields(username, email);
  if (alreadyExists) {
    return alreadyExists;
  }
  // else store the user
  await newUser.save();
  return (fullUserObject) ? newUser : reduceUser(newUser);
};

/**
 * This Method authenticates the user upon login. The user is fetched by his username from
 * the database and bcrypt compare the hashed password with the entered user password.
 * On success the user is returned.
 * On error the codes -1 for no user found or -2 password fail (=Unauthorized) are returned.
 *
 * @param {String} username
 * @param {String} password
 */
const authenticateUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) { return -1; }
  const success = await compare(password, user.password);
  return success ? reduceUser(user) : -2;
};

/**
 * Updates the user password. Return a status for success or error.
 * @param {String} _id
 * @param {String} newPassword
 */
const updatePassword = async (_id, newPassword) => {
  if (!newPassword) { return 'empty_password'; }
  // fetch the user by id
  const user = await User.findOne({ _id });
  if (!user) { return 'no_user_found'; }

  try { // try to encrypt the new password
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

/**
 * Deletes a user by his/her username. Returns false if no user is found.
 *
 * @param {String} username
 */
const deleteUser = async (username) => {
  const deleted = await User.findOneAndDelete({ username });
  if (!deleted) { return false; }
  return true;
};

/**
 * Get all Users.
 * @param {Boolean} fullUserObject decides wether the complete
 *                                 userobjects are returned
 */
const getUsers = async (fullUserObject = false) => {
  const users = await User.find({});
  return (fullUserObject) ? users : users.map((user) => reduceUser(user));
};

/**
 * Method to query searchterms in the database values of the attributes listed in the parameter.
 * @param {String} searchTerm
 * @param {Array} attributes to be searched for in databse (if none given the default list is used)
 */
const queryUser = async (searchTerm, attributes = ['firstname', 'lastname', 'username', 'email']) => {
  // Create a regex to split the searchterm on each whitespace
  // and replace it with a logical OR (useful for full name search)
  let regexString = '';
  regexString = searchTerm.split(' ').join('|');
  // modifier ig: g = global (return ALL matches) i = insensitive
  const regex = new RegExp(regexString, 'ig');

  // Create search condition containig each attribute and the regex
  // and search in db using the searchcondition
  const searchCondition = [];
  attributes.forEach((attribute) => {
    searchCondition.push({ [attribute]: regex });
  });
  // fetch all matchin user (with no duplicates)
  const users = await User.find({
    $or: searchCondition,
  });
  // return reduced user to secure sensible data
  return users.map((user) => reduceUser(user));
};

/**
 * Verifies the jwt token is valid and extracts the userid embedded in it. The user with this id
 * is then fetched and returned. If no user is found the error code -1 is returned.
 * @param {String} token
 */
const authenticateUserByJWT = async (token) => new Promise((resolve, reject) => {
  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) return reject(err);
    const user = await getUser({ _id: JSON.parse(decoded) });
    return (user === -1) ? resolve(-1) : resolve(user);
  });
});

/**
 * Extracts the user role of an event. (eventbasedRole)
 * Returns errorcode -1 if no user is found and -2 if no event with the
 * eventID is found for the user with the userID.
 * @param {String} _id
 * @param {String} eventID
 */
const checkRole = async (id, eventID) => {
  const user = await User.findById({ _id: id });
  if (!user) { return -1; }
  let role = -2;
  // go through the list of the user events and match the event id to extract the role
  user.eventbasedRole.forEach((value) => {
    if (value.event === Number(eventID)) {
      role = value.role;
    }
  });
  return role;
};

/**
 * Updates a user with the provided user id with the object containing the changed elements.
 * The userobject can only contain the attribute and value which is updated
 * (no full user object needed).
 *
 * @param {String} id
 * @param {*} userObj
 */
const updateUser = async (id, userObj) => {
  // check if the username and email can be updated
  const duplicationError = await checkUniqueFieldsByID(userObj.username, userObj.email, id);
  // duplicationError contains error code -1 or -2 if the user tries to update the username
  // or email with non unique values
  if (duplicationError) {
    return duplicationError;
  }
  // filter the db for the id, update the entry and return the updated object
  const filter = { _id: id };
  const userUpdated = await User.findOneAndUpdate(filter, userObj, { new: true });
  // if no user is found or something went wrong the method returns null
  // else the updated user is returned
  return (!userUpdated) ? null : reduceUser(userUpdated);
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
  getUsers,
};
