import api from './axiosClient';

const authApi = {
  register(data) {
    return api.post('/api/auth/register', data);
  },

  login(data) {
    return api.post('/api/auth/login', data);
  },

  changePassword(data) {
    return api.post('/api/auth/change-password', data);
  },

  forgotPassword(data) {
    return api.post('/api/auth/forgot-password', data);
  },

  resetPassword(data) {
    return api.post('/api/auth/reset-password', data);
  },
};

export default authApi;
