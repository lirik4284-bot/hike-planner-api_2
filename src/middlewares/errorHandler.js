const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = status === 500 ? 'Внутренняя ошибка сервера' : err.message;

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
  });
}

function notFound(req, res, next) {
  next(new ApiError(404, 'Маршрут не найден'));
}

module.exports = { errorHandler, notFound };
