import { defineStore } from 'pinia';
import balanceApi from '../api/balanceApi';

export const useBalanceStore = defineStore('balance', {
  state: () => ({
    balance: null,
    history: [],
    loading: false,
    error: null,
    topUpSuccess: false
  }),
  
  getters: {
    formattedBalance: (state) => {
      if (state.balance === null) return 'Загрузка...';
      return `${Number(state.balance).toFixed(2)} ₽`;
    },

    hasBalance: (state) => state.balance !== null
  },
  
  actions: {
    async fetchBalance() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await balanceApi.getBalance();
        this.balance = Number(response.data.amount);
        console.log('Fetched balance:', this.balance);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Ошибка при получении баланса';
        console.error('Error fetching balance:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    async topUpBalance(amount) {
      this.loading = true;
      this.error = null;
      this.topUpSuccess = false;
      
      try {
        const response = await balanceApi.topUp(amount);
        this.balance = Number(response.data.balance);
        console.log('Topped up balance:', this.balance);
        this.topUpSuccess = true;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Ошибка при пополнении баланса';
        console.error('Error topping up balance:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    async fetchHistory() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await balanceApi.getHistory();
        this.history = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Ошибка при получении истории баланса';
        console.error('Error fetching balance history:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    resetTopUpSuccess() {
      this.topUpSuccess = false;
    }
  }
}); 