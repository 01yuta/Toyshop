const AuthService = require('../services/AuthService');

const register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'username, email, password là bắt buộc' });
    }

    const user = await AuthService.register({ username, email, password, phone });

    return res.status(201).json({
      message: 'User registered successfully',
      data: user,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 'EMAIL_EXISTS' || err.code === 'USERNAME_EXISTS') {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'email và password là bắt buộc' });
    }

    const result = await AuthService.login({ email, password });

    return res.status(200).json({
      message: 'Login successfully',
      data: result, 
    });
  } catch (err) {
    console.error(err);

    if (err.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    return res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword và newPassword là bắt buộc' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    await AuthService.changePassword({ userId, currentPassword, newPassword });

    return res.status(200).json({
      message: 'Đổi mật khẩu thành công',
    });
  } catch (err) {
    console.error(err);

    if (err.code === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: err.message });
    }

    if (err.code === 'INVALID_PASSWORD') {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email là bắt buộc' });
    }

    const result = await AuthService.forgotPassword({ email });

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'token và newPassword là bắt buộc' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    await AuthService.resetPassword({ token, newPassword });

    return res.status(200).json({
      message: 'Đặt lại mật khẩu thành công',
    });
  } catch (err) {
    console.error(err);

    if (err.code === 'INVALID_TOKEN') {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
};
