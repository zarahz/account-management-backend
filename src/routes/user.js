const express = require('express');
const {
  createUser, authenticateUser, getUser, getUserByID, updateUser,
} = require('../lib/user');
const { securityQuestions, researchInterests } = require('../util/enums');

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

router.patch('/register', async (req, res) => {
  // user needs unique entries for database for email and username
  // used dummy number to ensure uniqueness
  try {
    const user = await createUser(req.body);
    return res.send(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.send({ error: 'duplicate-key', duplicate: error.keyValue });
    }
    return res.send({ error: error.errmsg });
  }
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
  const { id, answer } = req.query;
  const user = await getUserByID(id);
  if (user) {
    const dbAnswer = user.securityAnswer.toLowerCase().trim();
    const userAnswer = answer.toLowerCase().trim();
    if (userAnswer === dbAnswer) {
      return res.status(200);
    }
    return res.status(400).send({ error: 'wrong security answer' });
  }
  return res.send({ error: 'user not found' });
});

// TODO
router.patch('/updateUser', async (req, res) => {
  try {
    const updatedUser = await updateUser(req.body);
    return res.send(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.send({ error: 'duplicate-key', duplicate: error.keyValue });
    }
    return res.send({ error: error.errmsg });
  }
});
// TODO
router.patch('/updatePassword'); // needs params: answer to security question and new pw
router.delete('/deleteUser');

module.exports = router;
