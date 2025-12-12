const UserService = require('../services/UserService');

const createUser = async (req, res) => {
  try {
    const user = await UserService.createUser(req.body);
    return res.status(201).json({
      message: 'User created successfully',
      data: user,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await UserService.getUsers();
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await UserService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    await UserService.deleteUser(req.params.id);
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await UserService.getCurrentUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateCurrentUser = async (req, res) => {
  try {
    const user = await UserService.updateCurrentUser(req.user.id, req.body);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
};
