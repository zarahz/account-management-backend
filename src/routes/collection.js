const express = require('express');
const { securityQuestionsEN, securityQuestionsDE, researchInterests } = require('../util/enums');

const router = express.Router();

/**
 * Endpoint to fetch all security questions for the drop down element.
 * Requires a language code to return correct set.
 *
 * query: languageCode
 */
router.get('/securityQuestions', async (req, res) => {
  const { languageCode } = req.query;
  if (languageCode === 'de') {
    return res.status(200).send(securityQuestionsDE);
  }
  return res.status(200).send(securityQuestionsEN);
});

/**
 * entpoint to fetch all possible research interests
 */
router.get('/researchInterests', async (req, res) => { res.send(researchInterests); });

module.exports = router;
