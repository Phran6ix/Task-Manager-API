const AppError = require("../utils/appError");

const sendError = (err, req, res) => {
  return res.status(err.statusCode).json({
    err: err.errors,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error Ocurred";

  sendError(err, req, res, next);
};
