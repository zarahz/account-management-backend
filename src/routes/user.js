const express = require('express');
const {
  createUser, authenticateUser, getUser, getUserByID, deleteUser, updateUser, updatePassword,
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
  const user = await authenticateUser(username, password);

  if (!user) {
    return res.send('Unauthorized!');
  }

  res.cookie('user', JSON.stringify(user));
  if (redirectURL) {
    return res.redirect(redirectURL);
  }
  return res.send({ id: user.id, token: user.token });
});

router.post('/register', async (req, res) => {
  // user needs unique entries for database for email and username
  // used dummy number to ensure uniqueness
  try {
    const user = await createUser(req.body);
    if (user && Object.keys(user).length !== 0) {
      return res.send(user);
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.send({ error: 'duplicate-key', duplicate: error.keyValue });
    }
    return res.send({ error: error.message });
  }
  return res.send({ error: 'error' });
});

// check if username unique -> true means username is unique
router.get('/uniqueUsername', async (req, res) => {
  const { username } = req.query;
  const user = await getUser({ username });
  if (user) {
    return res.send(false);
  }
  return res.send(true);
});

// check if email unique -> true means email is unique
router.get('/uniqueEmail', async (req, res) => {
  const { email } = req.query;
  const user = await getUser({ email });
  if (user) {
    return res.send(false);
  }
  return res.send(true);
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
  return res.send({ error: 'user not found' });
});

router.patch('/updateUser/:userID', async (req, res) => {
  try {
    const { userID } = req.params;
    console.log(userID);
    const updatedUser = await updateUser(userID, req.body);
    return res.send(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.send({ error: 'duplicate-key', duplicate: error.keyValue });
    }
    return res.send({ error: error.errmsg });
  }
});

router.patch('/updatePassword/:userID', async (req, res) => {
  const { password } = req.body;
  const { userID } = req.param;
  const update = await updatePassword(userID, password);
  if (update === -1) {
    return res.status(400).send({ error: 'password update failed' });
  }

  return res.send(200);
});

router.post('/deleteUser', async (req, res) => {
  const { username, password } = req.body;
  const user = await authenticateUser(username, password);

  // check if user is authenticated
  if (!user) {
    return res.send('Unauthorized!');
  }

  // delete user in database
  const deleted = await deleteUser(username);
  if (deleted !== 0) {
    return res.status(400).send({ error: 'Deletion failed' });
  }

  // delete user in cookies
  res.clearCookie('user', JSON.stringify(user));

  return res.redirect('/');
});

module.exports = router;
