const User = require('../models/userModel');
const AppError = require('../utils/appErrors');
const catchAsyncErrors = require('./../utils/catchAsyncError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, curFile, cb) => {
//     //setting the destination of the uploaded file into the FS
//     cb(null, 'public/img/users');
//   },
//   filename: (req, curFile, cb) => {
//     //user-userID-currentTimeStamp.jpeg - file name structure
//     const fileExtension = curFile.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${fileExtension}`);
//   },
// });
const multerStorage = multer.memoryStorage();
/**
 * The function below checks wether the uploaded file is an image or not
 * @param {*} req
 * @param {*} curFile
 * @param {*} cb
 */
const multerFilter = (req, curFile, cb) => {
  if (curFile.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

//const upload = multer({dest:'public/img/users'});
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const createValidateUpdateBody = (reqObj, ...allowedFields) => {
  let obj = {};
  Object.keys(reqObj).forEach((el) => {
    if (allowedFields.includes(el)) {
      obj[el] = reqObj[el];
    }
  });
  return obj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.updateMe = catchAsyncErrors(async (req, res, next) => {
  // console.log(req.file);
  // console.log(JSON.stringify(req.body));
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for updating passwords, try /updatePassword',
        400
      )
    );
  const filteredBody = createValidateUpdateBody(req.body, 'name', 'email');
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

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

//READING USER DOCS
exports.getAllUsers = factory.getAll(User);
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
