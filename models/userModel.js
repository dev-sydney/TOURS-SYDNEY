const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please Provide A Name'],
      minlength: [5, 'Name Must Contain Atleast 10 Characters'],
      maxlength: [40, 'Name Must Contain Not More Than 40 Characters'],
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, 'Please Provide Us With An Email'],
      validate: [validator.isEmail, 'Please Enter A Vaild Email'],
      unique: true,
    },
    photo: String,
    password: {
      type: String,
      required: [true, 'Please Provide A Password'],
      select: false,
      minlength: 8,
    },
    passwordConfirm: {
      type: String,
      validate: {
        //Will Only Run on .create & .save()
        validator: function (val) {
          return val === this.password;
        },
        message: 'Passwords Do Not Match!',
      },
      required: [true, 'Please Confirm Your Password!'],
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      default: 'user',
      enum: ['admin', 'user', 'guide', 'lead-guide'],
    },
    resetPasswordToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 2000; //Took 2 seconds of the time because saving data to the DB takes some time

  next();
});

userSchema.methods.checkPasswordValidility = async function (
  candidatePassword,
  password
) {
  return await bcrypt.compare(candidatePassword, password);
};

userSchema.methods.didPasswordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    let changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //console.log({ JWTTimestamp }, { changedTimeStamp });
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};
userSchema.methods.setResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.resetPasswordToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //user gets 10 minutes before the token expires
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
