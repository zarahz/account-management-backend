
const { authenticateUserByJWT } = require('../lib/user');

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
    return res.status(401).end();
  }
};

module.exports = { tokenVerification };
