const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const User = require('./../models/userModel');
const catchAsyncErrors = require('./../utils/catchAsyncError');
const AppError = require('../utils/appErrors');
const sendMail = require('./../utils/email');
const catchAsyncError = require('./../utils/catchAsyncError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsyncErrors(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.signIn = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please provide an email and password!', 400));

  const user = await User.findOne({ email }).select('+password');
  console.log(user);

  if (!user || !(await user.checkPasswordValidility(password, user.password)))
    return next(new AppError('Incorrect password or email', 404));

  createSendToken(user, 200, res);
});
//AUTHENICATION
exports.protectRoute = catchAsyncErrors(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError(
        'You do not have access to this route! please try logging in again',
        401
      )
    );
  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const stillExistingUser = await User.findById(decodedPayload.id);
  if (!stillExistingUser)
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );

  if (stillExistingUser.didPasswordChangedAfter(decodedPayload.iat))
    return next(
      new AppError('Password has been changed recently.Try logging in again')
    );

  req.user = stillExistingUser;
  next();
});

//Only for rendered pages, produces no error
exports.isLoggedIn = catchAsyncErrors(async (req, res, next) => {
  if (req.cookies.jwt) {
    //1. Verifying Token
    const decodedPayload = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const stillExistingUser = await User.findById(decodedPayload.id);
    if (!stillExistingUser) {
      return next();
    }

    if (stillExistingUser.didPasswordChangedAfter(decodedPayload.iat)) {
      return next();
    }

    //AT THIS POINT, THERES A LOGGED IN USER
    //SO THEREFORE, MAKE THE USER ACCESSIBLE TO ALL TEMPLATES
    res.locals.user = stillExistingUser;
    //console.log('JUST LOGGED IN:❗❗❗', stillExistingUser);
    //The "res.locals" object can be accessed by all the pug templates
    //and so whatever property we attach to it will be accessible to all the pug templates
    //Similar to passing data into the render fn as an arg
    return next();
  }
  next();
});

//AUTHOURIZATION
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(`You do not have permission to perform this action`, 403)
      );
    next();
  };

//FORGOTPASSWORD
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError('No user with that email exists. Please try again', 404)
    );

  const resetToken = user.setResetPasswordToken();
  await user.save({ validateModifiedOnly: true });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

  try {
    await sendMail({
      email: req.body.email,
      subject: 'Your password reset token (valid for 10min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: `Token sent to the user's email`,
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateModifiedOnly: false });

    return next(new AppError('Error sending email, please try again!', 500));
  }
});

//RESET PASSWORD
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const cryptedResetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: cryptedResetToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');
  if (!user)
    return next(
      new AppError('Invalid Token or expired token, please try again', 400)
    );

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

//UPDATE PASSWORD
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  // Find the user based off the his/her id
  const user = await User.findById(req.user._id).select('+password');
  if (
    !(await user.checkPasswordValidility(
      req.body.currentPassword,
      user.password
    ))
  )
    return next(
      new AppError('Current Password is incorrect, please try again', 401)
    );

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});
