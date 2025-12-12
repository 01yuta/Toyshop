const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/UserModel');


const register = async ({ username, email, password, phone }) => {
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    const error = new Error('Email đã tồn tại');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    const error = new Error('Username đã tồn tại');
    error.code = 'USERNAME_EXISTS';
    throw error;
  }

  const newUser = await User.create({
    username,
    email,
    password, 
    phone,
  });

  const userObj = newUser.toObject();
  delete userObj.password;

  return userObj;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured');
    error.code = 'SERVER_ERROR';
    throw error;
  }

  const payload = { id: user._id, isAdmin: user.isAdmin };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '15m',
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

  user.refresh_token = refreshToken;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refresh_token;

  return {
    user: userObj,
    accessToken,
    refreshToken,
  };
};

const changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Mật khẩu hiện tại không đúng');
    error.code = 'INVALID_PASSWORD';
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully' };
};

const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { message: 'If email exists, reset link has been sent' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  return {
    message: 'If email exists, reset link has been sent',
    resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
  };
};

const resetPassword = async ({ token, newPassword }) => {
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Token không hợp lệ hoặc đã hết hạn');
    error.code = 'INVALID_TOKEN';
    throw error;
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: 'Password reset successfully' };
};

module.exports = {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
};
