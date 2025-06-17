const User = require('../Model/userModel');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const emailjs = require('../utils/email');
const Apperror = require('../utils/appError');
const jwt = require('jsonwebtoken');
// const sendEmail = require('../utils/email');
const Email = require('../utils/email');

function signJWT(id) {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_VALIDITY,
  });
  return token;
}
function createSendToken(user, statusCode, req, res) {
  const token = signJWT(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_VALIDITY_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // secure: true,
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };
  res.cookie('jwt', token, cookieOptions);
  //password removed only from display to client
  user.password = undefined;
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
}
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});
exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1)checking for providing both email and password
  if (!email || !password) {
    return next(new Apperror('provide email and  password', 400));
  }
  //2)check if user exist and password is correct
  const user = await User.findOne({ email: email }).select('+password');
  //console.log(user);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new Apperror('incorrect email and password', 401));
  }
  //3)if everything ok send token to client
  createSendToken(user, 200, res);
});
exports.protect = catchAsync(async (req, res, next) => {
  // console.log('entering here in auth');
  //1)getting token and check if the token is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // console.log('token from header', token);
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
    // console.log('token from cookie', token);
  }
  if (!token) {
    return next(new Apperror('please try to sign in ', 401));
  }
  //2)verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);
  //3)check if user still exist
  const freshUser = await User.findById(decoded.id);
  //console.log('fresh', freshUser);
  if (!freshUser) {
    return next(
      new Apperror('the user belonging to the token has no longer exist', 401),
    );
  }
  //4)check if user changed password after the token was issued
  if (freshUser.passwordChanged(decoded.iat)) {
    return next(new Apperror('password changed try to sign in again', 401));
  }
  //grant access to protected route
  req.user = freshUser;
  res.locals.user = freshUser;
  // console.log(req.user.id);
  next();
});
//Only for render pages ,not for error
exports.LoggedInOrNot = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      const freshUser = await User.findById(decoded.id);

      if (!freshUser) {
        return next();
      }

      if (freshUser.passwordChanged(decoded.iat)) {
        return next();
      }

      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
exports.restrictTo = (...roles) => {
  console.log('entering to restrict or not');
  return (req, res, next) => {
    console.log('helo', req.user.role);
    let userRoleExist = roles.includes(req.user.role);
    //console.log(userRoleExist, roles, req.user.role);
    if (!userRoleExist) {
      return next(
        new Apperror(
          'you dont have the permission to perform this operation',
          403,
        ),
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)get user based on posted email
  //console.log(req.body);
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new Apperror('there is no user with this email', 404));
  }
  //2)generate the random reset token
  const resettoken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  //3)send it to users email

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: `password reset token valid for 10min ${resetURL}`,
    //   text: message,
    // });
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resettoken}`;
    await new Email(user, resetURL).resetPassword();
    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    // console.error(err);
    user.resetToken = undefined;
    user.resetTokenExpireTime = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new Apperror(
        'there was an error in sending the mail.please try again',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpireTime: {
      $gt: Date.now(),
    },
  });
  //2)if token has not expired,and there is a user ,set the new password
  if (!user) {
    return next(new Apperror('Token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetToken = undefined;
  user.resetTokenExpireTime = undefined;
  await user.save();
  //3)update changePasswordAt property for the user
  //4)Log the user in send JWT
  createSendToken(user, 201, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, currentPassword } = req.body;
  //1)get user from collection
  //console.log(req);
  const user = await User.findById(req.user._id).select('+password');
  //2)check if posted current password is correct
  if (!user || !(await user.correctPassword(currentPassword, user.password))) {
    return next(new Apperror('incorrect password'), 401);
  }

  //if we use user.findByIdAndUpdate statement valdation ,onsave hook will not work
  //3)if so update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  //4)log user in send jwt
  createSendToken(user, 201, res);
});
