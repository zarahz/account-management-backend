const jwt = require('jsonwebtoken');
const express = require('express');
const config = require('../../config');

const router = express.Router();

router.get('/token', (req, res) => {
  const { token } = req.query;
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) return res.status(500).send({ error: 'Failed to authenticate token.' });

    return res.status(200).send(decoded);
  });
});

module.exports = router;
