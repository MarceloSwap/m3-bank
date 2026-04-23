const authService = require('../services/authService');

function authMiddleware(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }

    req.user = authService.verifyToken(token);
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = authMiddleware;
