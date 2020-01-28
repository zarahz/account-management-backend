const express = require('express');
const { getUser } = require('../lib/user');

const router = express.Router();

/**
 * Endpoint to check wether a given username already exists in the database and returns a bool
 *
 * query: username
 */
router.get('/uniqueUsername', async (req, res) => {
  const { username } = req.query;
  const user = await getUser({ username });
  if (user !== -1) {
    return res.status(200).send(false);
  }
  return res.status(200).send(true);
});

/**
 * Endpoint to check wether a given email already exists in the database and returns a bool
 *
 * query: email
 */
router.get('/uniqueEmail', async (req, res) => {
  const { email } = req.query;
  const user = await getUser({ email });
  if (user !== -1) {
    return res.status(200).send(false);
  }
  return res.status(200).send(true);
});

module.exports = router;
