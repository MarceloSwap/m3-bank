const authService = require('../services/authService');

module.exports = ({ req }) => {
  const authorization = req.headers.authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    return {};
  }

  const token = authorization.slice(7);

  try {
    return {
      user: authService.verifyToken(token)
    };
  } catch (error) {
    return {};
  }
};
