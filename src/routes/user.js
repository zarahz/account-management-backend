const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const {
  createUser, authenticateUser, getUser, deleteUser, updateUser, updatePassword, checkRole,
} = require('../lib/user');
const { tokenVerification } = require('./middleware');

const router = express.Router();

/**
 * login should get a redirect URL as param
 * when login was successful route to the redirect
 * and save the user in domain cookies
 * -> domain is used for all services
 * --> all services get user data!
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await authenticateUser(username, password);

  if (user === -1) { return res.status(400).send({ error: 'no user found' }); }
  if (user === -2) { return res.status(401).send({ error: 'Unauthorized!' }); }
  const token = jwt.sign(user.id, config.secret);
  res.cookie('user', JSON.stringify(token));
  return res.status(200).send({ token });
});

router.post('/register', async (req, res) => {
  // user needs unique entries for database for email and username
  // used dummy number to ensure uniqueness
  try {
    const user = await createUser(req.body);
    if (user && Object.keys(user).length !== 0) {
      const token = jwt.sign(user.id, config.secret);
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

// check if username unique -> true means username is unique
router.get('/uniqueUsername', async (req, res) => {
  const { username } = req.query;
  const user = await getUser({ username });
  if (user) {
    return res.status(200).send(false);
  }
  return res.status(200).send(true);
});

// check if email unique -> true means email is unique
router.get('/uniqueEmail', async (req, res) => {
  const { email } = req.query;
  const user = await getUser({ email });
  if (user) {
    return res.status(200).send(false);
  }
  return res.status(200).send(true);
});

router.post('/checkSecurityAnswer', async (req, res) => {
  const { id, securityAnswer } = req.body;
  const user = await getUser({ _id: id }, true); // true to get the user object with sensitive data
  if (user !== -1) {
    const dbAnswer = user.securityAnswer.toLowerCase().trim();
    const userAnswer = securityAnswer.toLowerCase().trim();
    if (userAnswer === dbAnswer) {
      return res.status(200).end();
    }
    return res.status(400).send({ error: 'wrong security answer' });
  }
  return res.status(403).send({ error: 'user not found' });
});

router.get('/userRoleByID', tokenVerification, async (req, res) => {
  const { id, event } = req.query;
  const role = await checkRole(id, event);
  if (role === -1) { return res.status(403).send({ error: 'no user found' }); }
  if (role === -2) { return res.status(403).send({ error: 'no event found' }); }
  return res.status(200).send({ role });
});

router.get('/userByID', tokenVerification, async (req, res) => {
  const id = { _id: req.query.id };
  const user = await getUser(id);
  if (user === -1) { return res.status(403).send({ error: 'no user found' }); }
  const token = jwt.sign(user.id, config.secret);
  return res.status(200).send({ token });
});

router.get('/researchInterestByID', tokenVerification, async (req, res) => {
  const id = { _id: req.query.id };
  const user = await getUser({ id });
  if (user === -1) { return res.status(403).send({ error: 'no user found' }); }
  return res.status(200).send(user.researchInterest);
});

router.patch('/updateUser/:id', tokenVerification, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await updateUser(id, req.body);
    if (updatedUser === -1) { return res.status(403).send({ error: 'no user found' }); }
    const token = jwt.sign(JSON.stringify(updatedUser.id), config.secret);
    return res.status(200).send({ token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({ error: 'duplicate-key', duplicate: error.keyValue });
    }
    return res.status(500).send({ error: error.errmsg });
  }
});

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


  // delete user in database
  const deleted = await deleteUser(username);
  if (deleted !== 0) {
    return res.status(500).send({ error: 'Deletion failed' });
  }

  // delete user in cookies
  res.clearCookie('user', JSON.stringify(user));

  return res.status(200).redirect('/');
});

router.post('/securityQuestion', async (req, res) => {
  const { email } = req.body;
  const user = await getUser({ email }, true);
  if (user) {
    const userData = { id: user.id, securityQuestion: user.securityQuestion };
    return res.status(200).send({ userData });
  }
  return res.status(403).send({ error: 'user not found' });
});

module.exports = router;
