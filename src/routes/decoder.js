const express = require('express');
const { tokenVerification } = require('./middleware');

const router = express.Router();

router.get('/token', tokenVerification, (req, res) => res.status(200).send(req.user));

module.exports = router;
