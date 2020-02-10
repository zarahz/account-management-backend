const express = require('express');
const axios = require('axios').default;
const {
  createUser, authenticateUser, getUser, deleteUser, updateUser,
  updatePassword, checkRole, queryUser, getUsers,
} = require('../lib/user');
const { generateToken } = require('../util/sign');
const { tokenVerification } = require('./middleware');

const router = express.Router();

/**
 * Endpoint to enable user registration. After storing the new user successfully in the
 * database a token is generated, returned and stored as cookie.
 * On failure an error message with respective status is returned.
 *
 * body: user object to be registered
 */
router.post('/register', async (req, res) => {
  try {
    const user = await createUser(req.body);
    if (user && Object.keys(user).length !== 0) {
      const token = generateToken(user.id);
      res.cookie('token', token, { httpOnly: false });
      return res.status(200).send({ token });
    }
    if (user === -1) {
      return res.status(400).send({ error: 'username already exists' });
    }
    if (user === -2) {
      return res.status(400).send({ error: 'this email is already used' });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({ error: 'duplicate-key', duplicate: error.keyValue });
    }
    return res.status(500).send({ error: error.message });
  }
  return res.status(500).send({ error: 'error' });
});

/**
 * The user id and event id are used to fetch the eventbasedRole. On success the role is returned.
 *
 * query: token, id, event
 */
router.get('/userRoleByID', tokenVerification, async (req, res) => {
  const { id, event } = req.query;
  const role = await checkRole(id, event);
  if (role === -1) { return res.status(403).send({ error: 'no user found' }); }
  if (role === -2) { return res.status(403).send({ error: 'no event found' }); }
  return res.status(200).send({ role });
});

/**
 * Endpoint to get all users
 *
 * query: token
 */
router.get('/users', tokenVerification, async (req, res) => {
  let users = [];
  users = await getUsers();
  return res.status(200).send({ users });
});

/**
 * Endpoint to get user with a specific id.
 *
 * query: token, id
 */
router.get('/userByID', tokenVerification, async (req, res) => {
  const id = { _id: req.query.id };
  const user = await getUser(id);
  if (user === -1) { return res.status(403).send({ error: 'no user found' }); }
  return res.status(200).send({ user });
});

/**
 * Endpoint to get all users matching the searchterm. The requestor can also provide
 * an attributes list in which the searchterm is searched for.
 * (i.e. ["researchInterest"] as attributes and "machine" as searchterm)
 * If no attribute list is provided it will search in username, last- and firstname and email.
 *
 * query: token
 * body: searchTerm, attributes
 */
router.post('/queryUser', tokenVerification, async (req, res) => {
  const { searchTerm, attributes } = req.body;
  if (!searchTerm || searchTerm === ' ') {
    return res.status(200).send([]);
  }
  const queriedUsers = await queryUser(searchTerm, attributes);
  return res.status(200).send(queriedUsers);
});

/**
 * Endpoint to get all researchInterests of a specific user.
 *
 * query: token, id
 */
router.get('/researchInterestByID', tokenVerification, async (req, res) => {
  const id = { _id: req.query.id };
  const user = await getUser({ id });
  if (user === -1) { return res.status(403).send({ error: 'no user found' }); }
  return res.status(200).send(user.researchInterest);
});

/**
 * Endpoint to update a user.
 *
 * params: id
 * query: token
 * body: object containing new values
 */
router.patch('/updateUser/:id', tokenVerification, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await updateUser(id, req.body);
    if (!updatedUser) { return res.status(403).send({ error: 'no user found' }); }
    if (updatedUser === -1) {
      return res.status(400).send({ error: 'username already exists' });
    }
    if (updatedUser === -2) {
      return res.status(400).send({ error: 'this email is already used' });
    }
    const token = generateToken(updatedUser.id);
    return res.status(200).send({ token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({ error: 'duplicate-key', duplicate: error.keyValue });
    }
    return res.status(500).send({ error: error.errmsg });
  }
});

/**
 * Endpoint to update the password of a user.
 *
 * params: id
 * query: token
 * body: newPassword
 */
router.patch('/updatePassword/:id', tokenVerification, async (req, res) => {
  const { newPassword } = req.body;
  const { id } = req.params;
  const updateResult = await updatePassword(id, newPassword);

  switch (updateResult) {
    case 'success':
      return res.send(200).end();
    case 'empty_password':
      return res.status(400).send({ error: 'no password entered' });
    case 'no_user_found':
      return res.status(403).send({ error: 'no user found' });
    case 'encryption_failed':
      return res.status(500).send({ error: 'password encryption failed' });
    default:
      return res.status(500).send({ error: 'password update failed' });
  }
});

/**
 * Endpoint to delete a user.
 *
 * query: token
 * body: username, password
 */
router.post('/deleteUser', tokenVerification, async (req, res) => {
  const { username, password } = req.body;
  const user = await authenticateUser(username, password);

  // check if user is authenticated
  if (user === -1) {
    return res.status(403).send({ error: 'no user found' });
  }
  if (user === -2) {
    return res.status(401).send({ error: 'Unauthorized!' });
  }
  // cancel events that are hosted by the user
  await axios.put(`https://pwp.um.ifi.lmu.de/g05/events/leave/${user.id}/${req.query.token}?account_id=${user.id}`)
    .then((response) => {
      if (response.status !== 200) {
        return res.status(500).send({ error: 'Deletion failed' });
      }
      return response.data;
    })
    .catch(() => res.status(500).send({ error: 'Deletion failed' }));

  // delete user in database
  const deleted = await deleteUser(username);
  if (!deleted) {
    return res.status(500).send({ error: 'Deletion failed' });
  }

  // delete user in cookies
  res.clearCookie('token');
  res.clearCookie('user');

  return res.status(200).end();
});

module.exports = router;
