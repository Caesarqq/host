import { defineStore } from 'pinia';
import auctionsApi from '../api/auctionsApi';

export const useAuctionsStore = defineStore('auctions', {
  state: () => ({
    auctions: [],
    currentAuction: null,
    auctionEvents: [],
    loading: false,
    error: null,
    $api: auctionsApi
  }),
  
  getters: {
    hasAuctions: (state) => state.auctions.length > 0,
    activeAuctions: (state) => {
      const now = new Date();
      return state.auctions.filter(auction => {
        const endDate = new Date(auction.end_date);
        return endDate > now;
      });
    }
  },
  
  actions: {
    async fetchAuctions() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await this.$api.getAuctions();
        this.auctions = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Ошибка при загрузке аукционов';
        console.error('Error fetching auctions:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    async fetchAuctionById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await this.$api.getAuctionById(id);
        this.currentAuction = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Ошибка при загрузке данных аукциона';
        console.error(`Error fetching auction with ID ${id}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    async fetchAuctionEvents(auctionId) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await this.$api.getAuctionEvents(auctionId);
        this.auctionEvents = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Ошибка при загрузке событий аукциона';
        console.error(`Error fetching auction events for auction ID ${auctionId}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    async createAuction(formData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await this.$api.createAuction(formData);
        await this.fetchAuctions();
        
        return response.data;
      } catch (error) {
        console.error('Store: ошибка при создании аукциона:', error);
        if (error.response?.status === 400) {
          const errors = error.response.data;
          if (typeof errors === 'object' && errors !== null) {
            let errorMessage = '';
            for (const key in errors) {
              errorMessage += `${key}: ${errors[key].join(', ')}\n`;
            }
            this.error = errorMessage || 'Ошибка валидации формы';
          } else {
            this.error = errors?.detail || 'Ошибка при создании аукциона';
          }
        } else {
          this.error = error.response?.data?.detail || 'Ошибка при создании аукциона';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },
    clearCurrentAuction() {
      this.currentAuction = null;
      this.auctionEvents = [];
    },
    async updateAuction(id, formData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await this.$api.updateAuction(id, formData);
        await this.fetchAuctions();
        if (this.currentAuction && this.currentAuction.id === id) {
          this.currentAuction = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Ошибка при обновлении аукциона';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async deleteAuction(id) {
      this.loading = true;
      this.error = null;
      try {
        await this.$api.deleteAuction(id);
        await this.fetchAuctions();
        if (this.currentAuction && this.currentAuction.id === id) {
          this.clearCurrentAuction();
        }
        return true;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Ошибка при удалении аукциона';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 