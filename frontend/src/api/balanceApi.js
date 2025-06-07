import apiClient from './axios';

export default {
  getBalance() {
    return apiClient.get('/users/balance/');
  },
  topUp(amount) {
    return apiClient.post('/users/balance/top-up/', { amount });
  },
  getHistory() {
    return apiClient.get('/users/balance/history/');
  }
}; 