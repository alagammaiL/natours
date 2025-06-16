const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { Timestamp } = require('mongodb');
const crypto = require('crypto');
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is mandatory'],
    trim: true,
    minlength: [5, 'name value greater than 5 characters'],
    maxlength: [10, 'name value less than 5 characters'],
  },
  email: {
    type: String,
    required: [true, 'email is mandatory'],
    trim: true,
    validate: [validator.isEmail, 'invalid email id'],
    unique: true,
    lowercase: true,
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    trim: true,
    minlength: [8, 'password should be greater than or equal to 8 characters'],
    required: [true, 'password is mandatory'],
    select: false,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, 'confirm password is mandatory'],
    //this validation will work when create and save
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'password mismatch',
    },
  },
  passwordChangedAt: Date,
  resetToken: String,
  resetTokenExpireTime: Date,
});
//this middleware call inbetween document created and save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  //hashing the passsword with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //password conform is used for whther user i retyping the same password once that is checked set it to undefined
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async (
  currentPassword,
  alreadyInDbPassword,
) => {
  return await bcrypt.compare(currentPassword, alreadyInDbPassword);
};
userSchema.methods.passwordChanged = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeSTamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    //console.log(jwtTimeStamp, changedTimeSTamp);
    return jwtTimeStamp < changedTimeSTamp;
    //200<300 return true
    //400<300 return false password not changed
    //jwttoken is old when compared to new password changed time return true
  }
  //false means no password changed
  return false;
};
userSchema.methods.createResetPasswordToken = function () {
  //setting random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  //encrypting the random token
  this.resetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //token expires in 10 minutes
  this.resetTokenExpireTime = Date.now() + 10 * 60 * 1000;
  //console.log(resetToken, this.resetToken);
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
