import apiClient from './axios';

export default {
  getUserBids() {
    return apiClient.get('/bids/my_bids/');
  },
  getLotBids(lotId) {
    return apiClient.get(`/bids/by_lot/?lot_id=${lotId}`);
  },
  createBid(lotId, amount) {
    return apiClient.post('/bids/', {
      lot: lotId,
      amount
    });
  },
  getUserWinnings() {
    return apiClient.get('/transactions/my_purchases/');
  },
  getTransactionById(transactionId) {
    return apiClient.get(`/transactions/${transactionId}/`);
  },
  payForWinning(bidId, paymentMethod) {
    console.log(`API call: payForWinning with bidId=${bidId}, method=${paymentMethod}`);
    
    if (!bidId) {
      return Promise.reject(new Error('Не указан ID ставки для оплаты'));
    }
    const timestamp = new Date().getTime();
    return apiClient.post(`/bids/${bidId}/pay/`, {
      payment_method: paymentMethod,
      timestamp: timestamp
    }, {
      headers: {
        'X-Debug-Info': 'Payment request from frontend',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  },
  saveDeliveryDetails(transactionId, deliveryData) {
    return apiClient.post(`/delivery/`, {
      transaction: transactionId,
      ...deliveryData
    });
  },
  confirmDelivery(bidId) {
    return apiClient.post(`/bids/${bidId}/confirm-delivery/`);
  },
  getDeliveryDetails(transactionId) {
    return apiClient.get(`/delivery/${transactionId}/`);
  }
};
