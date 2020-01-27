const express = require('express');
const { getUser } = require('../lib/user');

const router = express.Router();

// check if username unique -> true means username is unique
router.get('/uniqueUsername', async (req, res) => {
  const { username } = req.query;
  const user = await getUser({ username });
  if (user !== -1) {
    return res.status(200).send(false);
  }
  return res.status(200).send(true);
});

// check if email unique -> true means email is unique
router.get('/uniqueEmail', async (req, res) => {
  const { email } = req.query;
  const user = await getUser({ email });
  if (user !== -1) {
    return res.status(200).send(false);
  }
  return res.status(200).send(true);
});

module.exports = router;
