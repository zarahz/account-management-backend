const express = require('express');
const { securityQuestionsEN, securityQuestionsDE, researchInterests } = require('../util/enums');

const router = express.Router();

router.get('/securityQuestions', async (req, res) => {
  const { languageCode } = req.query;
  if (languageCode === 'de') {
    res.status(200).send(securityQuestionsDE);
  } else if (languageCode === 'en') {
    res.status(200).send(securityQuestionsEN);
  }
});

router.get('/researchInterests', async (req, res) => { res.send(researchInterests); });

module.exports = router;
