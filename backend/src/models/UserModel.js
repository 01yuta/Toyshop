const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin:  { type: Boolean, default: false },
    phone:    { type: String },
    address:  { type: String },
    city:     { type: String },
    country:  { type: String, default: 'Vietnam' },
    avatar:   { type: String },
    access_token:  { type: String },
    refresh_token: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (passwordInput) {
  return bcrypt.compare(passwordInput, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
