const express = require('express');
const {
  createUser, authenticateUser, getUser, getUserByID, deleteUser, updateUser, updatePassword, getUserInfoByID, checkRole, login,
} = require('../lib/user');

const router = express.Router();

/**
 * login should get a redirect URL as param
 * when login was successful route to the redirect
 * and save the user in domain cookies
 * -> domain is used for all services
 * --> all services get user data!
 */
router.post('/login', async (req, res) => {
  const { redirectURL } = req.params;
  const { username, password } = req.body;
  const user = await login(username, password);

  if (user === -1) { return res.status(403).send({ error: 'no user found' }); }
  if (user === -2) { return res.status(401).send({ error: 'Unauthorized!' }); }
  res.cookie('user', JSON.stringify(user));
  if (redirectURL) {
    return res.status(200).redirect(redirectURL);
  }
  return res.status(200).send({ id: user.id, token: user.token });
});

router.post('/register', async (req, res) => {
  // user needs unique entries for database for email and username
  // used dummy number to ensure uniqueness
  try {
    const user = await createUser(req.body);
    if (user && Object.keys(user).length !== 0) {
      return res.status(200).send(user);
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

router.get('/checkSecurityAnswer', async (req, res) => {
  const { id, securityAnswer } = req.body;
  const user = await getUserByID(id);
  if (user) {
    const dbAnswer = user.securityAnswer.toLowerCase().trim();
    const userAnswer = securityAnswer.toLowerCase().trim();
    if (userAnswer === dbAnswer) {
      return res.status(200).end();
    }
    return res.status(400).send({ error: 'wrong security answer' });
  }
  return res.status(403).send({ error: 'user not found' });
});

router.get('/userRoleByID', async (req, res) => {
  const { id, event } = req.body;
  const role = await checkRole(id, event);
  if (role === -1) { return res.status(400).send({ error: 'entered id has wrong length' }); }
  if (role === -2) { return res.status(403).send({ error: 'no user found' }); }
  if (role === -3) { return res.status(403).send({ error: 'no event found' }); }
  return res.status(200).send({ role });
});

router.get('/userByID', async (req, res) => {
  const { id } = req.body;
  const user = await getUserInfoByID(id);
  if (user === -1) { return res.status(400).send({ error: 'entered id has wrong length' }); }
  if (user === -2) { return res.status(403).send({ error: 'no user found' }); }
  res.status(200).send(user);
});

router.get('/userInterestByID', async (req, res) => {
  const { id } = req.body;
  const user = await getUserByID(id);
  if (user === -1) { return res.status(400).send({ error: 'entered id has wrong length' }); }
  if (user === -2) { return res.status(403).send({ error: 'no user found' }); }
  res.status(200).send(user.researchInterest);
});

router.patch('/updateUser/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await updateUser(id, req.body);
    return res.send(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({ error: 'duplicate-key', duplicate: error.keyValue });
    }
    return res.status(500).send({ error: error.errmsg });
  }
});

router.patch('/updatePassword/:id', async (req, res) => {
  const { newPassword } = req.body;
  const { id } = req.param;
  const update = await updatePassword(id, newPassword);
  if (update === -1) { return res.status(403).send({ error: 'no user found' }); }
  if (update === -2) {
    return res.status(400).send({ error: 'no password entered' });
  }
  if (update === -3) {
    return res.status(500).send({ error: 'password update failed' });
  }
  if (update === -4) {
    return res.status(500).send({ error: 'password encryption failed' });
  }

  return res.send(200);
});

router.post('/deleteUser', async (req, res) => {
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

module.exports = router;
