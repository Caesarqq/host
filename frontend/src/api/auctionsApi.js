import apiClient from './axios';

export default {
  getAuctions() {
    return apiClient.get('/v1/auctions/');
  },

  getAuctionById(id) {
    return apiClient.get(`/v1/auctions/${id}/`);
  },

  getAuctionEvents(auctionId) {
    return apiClient.get(`/auction-events/?auction=${auctionId}`);
  },

  getCharities() {
    return apiClient.get('/charities/');
  },

  createAuction(auctionData) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    return apiClient.post('/v1/auctions/create/', auctionData, config);
  },
  updateAuction(id, auctionData) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return apiClient.put(`/v1/auctions/${id}/update/`, auctionData, config);
  },

  deleteAuction(id) {
    return apiClient.delete(`/v1/auctions/${id}/delete/`);
  },

  purchaseTicket(auctionId) {
    return apiClient.post('/v1/auctions/tickets/purchase/', { auction: auctionId });
  },

  checkTicketAccess(auctionId) {
    return apiClient.get(`/v1/auctions/tickets/check-access/?auction_id=${auctionId}`);
  }
};