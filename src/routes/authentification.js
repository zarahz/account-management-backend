const express = require('express');
const {
  authenticateUser, getUser,
} = require('../lib/user');
const { tokenVerification } = require('./middleware');
const { generateToken, validateToken } = require('../util/sign');

const router = express.Router();

// ------------ User specific

/**
 * An Endpoint that decodes token and returns the user, whom id is signed within the token.
 *
 * res.query: token
 */
router.get('/token', tokenVerification, (req, res) => {
  res.cookie('user', JSON.stringify(req.user), { httpOnly: false });
  return res.status(200).send(req.user);
});

/**
 * Endpoint to log user in, by checking if a user exists with given username
 * and whether the password matches. On success a token is generated with the user id.
 * Finally a cookie is set containing the token and the token itself is returned.
 *
 * req.body : username, password
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await authenticateUser(username, password);

  if (user === -1) { return res.status(400).send({ error: 'no user found' }); }
  if (user === -2) { return res.status(401).send({ error: 'Unauthorized!' }); }
  const token = generateToken(user.id);
  res.cookie('token', token, { httpOnly: false });
  return res.status(200).send({ token });
});

/**
 * An endpoint to check whether a given security answer matches to the answer saved in the database.
 * If the answer matches a token is generated and status 200 is returned
 *
 * req.body : user id, securityAnswer
 */
router.post('/checkSecurityAnswer', async (req, res) => {
  const { id, securityAnswer } = req.body;
  const user = await getUser({ _id: id }, true); // true to get the user object with sensitive data
  if (user !== -1) {
    const dbAnswer = user.securityAnswer.toLowerCase().trim();
    const userAnswer = securityAnswer.toLowerCase().trim();
    if (userAnswer === dbAnswer) {
      const token = generateToken(user.id);
      res.cookie('token', token, { httpOnly: false });
      return res.status(200).end();
    }
    return res.status(400).send({ error: 'wrong security answer' });
  }
  return res.status(403).send({ error: 'user not found' });
});

/**
 * An Endpoint to fetch the security question to an given email.
 * Returns a userdata object containing the user id and security question on success.
 *
 * req.body: email
 */
router.post('/securityQuestion', async (req, res) => {
  const { email } = req.body;
  const user = await getUser({ email }, true);
  if (user !== -1) {
    const userData = { id: user.id, securityQuestion: user.securityQuestion };
    return res.status(200).send({ userData });
  }
  return res.status(403).send({ error: 'user not found' });
});

// ------------ general authentification
/**
 * Validates a given token with the set secret to enable more security for the other services.
 *
 * req.query: token
 */
router.get('/validateToken', async (req, res) => {
  const isValid = await validateToken(req.query.token);
  if (!isValid) {
    return res.status(401).send({ error: 'Unauthorized!' });
  }
  return res.status(200).end();
});

module.exports = router;
