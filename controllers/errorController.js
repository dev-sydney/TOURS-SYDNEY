const AppError = require('../utils/appErrors');
/////?//////////////////////////////////////////////////
const HandleDuplicateFieldsDB = (errObj) => {
  const message = `Duplicate Field Value: ${errObj.keyValue.name}. PLease Use Another Value...`;
  return new AppError(message, 400);
};
const handleCastErrorsDB = (errObj) => {
  const message = `Invalid ${errObj.path}: ${errObj.value}`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (errObj) => {
  const errorsMsg = Object.values(errObj.errors)
    .map((el) => el.message)
    .join('. ');

  return new AppError(errorsMsg, 400);
};
const handleJWTError = () =>
  new AppError('Invalid Token, try logging again', 401);

/////?//////////////////////////////////////////////////
const sendErrorDev = (err, req, res) => {
  //ERROR FOR THE API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }
  //ERROR FOR THE RENDERED WEBSITE
  console.error('ERROR❗❗❗', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong!',
    msg: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  //ERROR FOR THE API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //console.error('ERROR❗❗❗', err);

    return res.status(500).json({
      status: 'error',
      message: 'Something Went Very Wrong!',
    });
  }
  //ERROR FOR THE RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong!',
      msg: err.message,
    });
  }
  //console.error('ERROR❗❗❗', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong!',
    msg: 'Please Try Again Later.',
  });
};
//////////////////////////////////////
module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.code === 11000) error = HandleDuplicateFieldsDB(error);
    if (err.name === 'CastError') error = handleCastErrorsDB(error);

    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError();
    sendErrorProd(error, req, res);
  }
};
