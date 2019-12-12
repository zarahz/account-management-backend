const express = require('express');
const { securityQuestions, researchInterests } = require('../util/enums');

const router = express.Router();

router.get('/securityQuestions', (req, res) => { res.send(securityQuestions); });

router.get('/researchInterests', (req, res) => { res.send(researchInterests); });

module.exports = router;
