const User = require('../models/UserModel');

const createUser = async (userData) => {
  const user = await User.create(userData);
  return sanitize(user);
};

const sanitize = (user) => {
  if (!user) return null;
  const obj = user.toObject();
  delete obj.password;
  delete obj.refresh_token;
  return obj;
};

const getUsers = async () => {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(sanitize);
};

const updateUser = async (id, payload) => {
  const allowed = ['username', 'email', 'phone', 'isAdmin'];
  const data = {};
  allowed.forEach((key) => {
    if (payload[key] !== undefined) {
      data[key] = payload[key];
    }
  });
  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return sanitize(user);
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  return sanitize(user);
};

const updateCurrentUser = async (userId, payload) => {
  const allowed = ['username', 'email', 'phone', 'address', 'city', 'country', 'avatar'];
  const data = {};
  allowed.forEach((key) => {
    if (payload[key] !== undefined) {
      data[key] = payload[key];
    }
  });
  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });
  return sanitize(user);
};

const deleteUser = async (id) => {
  await User.findByIdAndDelete(id);
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
};
