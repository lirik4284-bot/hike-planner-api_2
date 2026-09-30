const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Требуется авторизация');
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwt.secret);
    const user = await User.findByPk(payload.id, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      throw new ApiError(401, 'Пользователь не найден');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Недействительный или истёкший токен'));
    }
    next(error);
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }
  return auth(req, res, next);
}

module.exports = { auth, optionalAuth };
