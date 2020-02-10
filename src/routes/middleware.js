
const { authenticateUserByJWT } = require('../lib/user');

/**
 * The Endpoints using this middleware always require the token as query which is used here.
 * authenticateUserByJWT fetches the user from the database with the decoded userid of the token.
 * If something fails or the token is not valid an error is returned.
 * If no errors occur the user is stored in the req object (req.user),
 * which can then be used inside other endpoints using this middleware.
 *
 * @param {*} req query: token
 * @param {*} res
 * @param {*} next
 */
const tokenVerification = async (req, res, next) => {
  try {
    const user = await authenticateUserByJWT(req.query.token);
    if (!user) {
      return res.status(401).send({ error: 'Unauthorized!' });
    }
    if (user === -1) {
      return res.status(403).send({ error: 'no user found' });
    }
    req.user = user;
    return next();
  } catch (error) {
    console.log('-------- tokenVerification ------- Catch!!!');
    return res.status(401).end();
  }
};

module.exports = { tokenVerification };
