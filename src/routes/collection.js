const express = require('express');
const { securityQuestionsEN, securityQuestionsDE, researchInterests } = require('../util/enums');

const router = express.Router();

router.get('/securityQuestions', (req, res) => {
  const { languageCode } = req.body;
  if (languageCode === 'de') {
    res.send(securityQuestionsDE);
  } else if (languageCode === 'en') {
    res.send(securityQuestionsEN);
  }
});

router.get('/researchInterests', (req, res) => { res.send(researchInterests); });

module.exports = router;
