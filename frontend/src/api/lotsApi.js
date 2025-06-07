import apiClient from './axios';

export default {
  getLots(params = {}) {
    return apiClient.get('/v1/lots/', { params });
  },
  getLotsByAuction(auctionId) {
    console.log(`API: Запрос лотов для аукциона с ID ${auctionId}`);
    return apiClient.get(`/v1/lots/auction/${auctionId}/`);
  },
  getLotById(id) {
    return apiClient.get(`/v1/lots/${id}/`);
  },
  createLot(lotData) {
    return apiClient.post('/v1/lots/', lotData);
  },
  updateLot(id, lotData) {
    return apiClient.put(`/v1/lots/${id}/update/`, lotData);
  },
  deleteLot(id) {
    return apiClient.delete(`/v1/lots/${id}/delete/`);
  },
  uploadImage(lotId, imageFile) {
    const formData = new FormData();
    formData.append('lot', lotId);
    formData.append('image', imageFile);
    
    return apiClient.post('/lot-images/', formData);
  },
  deleteImage(imageId) {
    return apiClient.delete(`/lot-images/${imageId}/`);
  },
  getCategories() {
    return apiClient.get('/v1/categories/');
  },
  approveLot(id) {
    console.log(`API: Одобрение лота с ID ${id}`);
    return apiClient.post(`/v1/lots/${id}/approve/`);
  },
  rejectLot(id) {
    console.log(`API: Отклонение лота с ID ${id}`);
    return apiClient.post(`/v1/lots/${id}/reject/`);
  }
};
