
const { authenticateUserByJWT } = require('../lib/user');

const tokenVerification = async (req, res, next) => {
  try {
    const user = await authenticateUserByJWT(req.query.token);
    if (!user) {
      return res.status(401).send({ error: 'Unauthorized!' });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).end();
  }
};

module.exports = { tokenVerification };
