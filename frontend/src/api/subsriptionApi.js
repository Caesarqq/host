import apiClient from './axios';

export default {
  getSubscriptionStatus() {
    return apiClient.get('/users/subscription/');
  },
  createSubscription(paymentMethod) {
    return apiClient.post('/users/subscription/', { payment_method: paymentMethod });
  },
  cancelSubscription() {
    return apiClient.delete('/users/subscription/');
  }
};