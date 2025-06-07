import apiClient from './axios';

export default {
  register(userData) {
    return apiClient.post('/users/register/', userData);
  },
  login(credentials) {
    return apiClient.post('/token/', credentials);
  },
  refreshToken(refreshToken) {
    return apiClient.post('/token/refresh/', { refresh: refreshToken });
  },
  getProfile() {
    return apiClient.get('/users/profile/');
  },
  getUserCharity() {
    return apiClient.get('/users/me/charity/');
  },
  getCharities() {
    return apiClient.get('/charities/');
  },
  verifyEmail(token) {
    return apiClient.get(`/users/verify-email/?token=${token}`);
  }
};
