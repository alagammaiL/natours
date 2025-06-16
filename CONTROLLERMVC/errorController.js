const ErrorApp = require('../utils/appError');

function errorResDevelop(err, req, res) {
  //Api
  if (req.originalUrl.startsWith('/api'))
    res.status(err.statusCode).json({
      status: err.status,
      stack: err.stack,
      message: err.message,
      error: err,
    });
  else {
    //render
    res.status(err.statusCode).render('error', {
      title: 'Error page',
      msg: err.message,
    });
  }
}
function errorResProduction(err, req, res) {
  //handling operational error like invalid id ,no router found
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //handling programming error like value undefined
    else {
      //console.error('error ', err);
      res.status(500).json({
        status: 'error',
        message: 'something went very wrong',
      });
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Error page',
        msg: err.message,
      });
    } else {
      res.status(err.statusCode).render('error', {
        title: 'Error page',
        msg: `Something went wrong please try again later`,
      });
    }
  }
}
function handlingCastError(err) {
  return new ErrorApp(`invalid ${err.path} and ${err.value}`, 400);
}
function handlingDuplicateErrorFromDB(err) {
  let errorValue = err.message;
  errorValue = errorValue.match(/([\'"])(.*?)\1/g)[0];
  return new ErrorApp(`repitation of value ${errorValue}`, 400);
}
function handlingValidationError(err) {
  let errorValue = Object.values(err.errors).map((el) => el.message);

  return new ErrorApp(`validation error occured.${errorValue.join(' ')}`, 400);
}
function handlinJWTtokenError() {
  return new ErrorApp('invalid token try to sign in', 401);
}
function handlingTokenExpired() {
  return new ErrorApp('token expired please try to sign in', 401);
}
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    errorResDevelop(err, req, res);
  } else if (process.env.NODE_ENV.trim().toLowerCase() === 'production') {
    let error = { ...err };
    error.message = err.message;
    //console.log(error);
    if (error.name == 'CastError') error = handlingCastError(err);
    if (error.code === 11000) error = handlingDuplicateErrorFromDB(err);
    if (error._message == 'Validation failed')
      error = handlingValidationError(err);
    if (error.name === 'JsonWebTokenError') error = handlinJWTtokenError();
    if (error.name === 'TokenExpiredError') error = handlingTokenExpired();
    errorResProduction(error, req, res);
  }
};
