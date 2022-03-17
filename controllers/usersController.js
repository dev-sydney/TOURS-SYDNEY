const fs = require('fs');
const User = require('../models/userModel');
const AppError = require('../utils/appErrors');
const catchAsyncErrors = require('./../utils/catchAsyncError');
const factory = require('./handlerFactory');

const createValidateUpdateBody = (reqObj, ...allowedFields) => {
  let obj = {};
  Object.keys(reqObj).forEach((el) => {
    if (allowedFields.includes(el)) {
      obj[el] = reqObj[el];
    }
  });
  return obj;
};

exports.updateMe = catchAsyncErrors(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for updating passwords, try /updatePassword',
        400
      )
    );
  const filteredBody = createValidateUpdateBody(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.getUser = factory.getOne(User);

exports.createNewUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    data: {
      message: 'Route Not Defined Yet...',
    },
  });
};
//DO NOT UPDATE PASSWORDS WITH THIS
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
