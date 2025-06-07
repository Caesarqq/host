import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import authApi from '../api/authApi';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    user: null,
    userCharity: null,
    loading: false,
    error: null,
    registerSuccess: false,
    registerMessage: ''
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.accessToken,

    tokenData: (state) => {
      if (!state.accessToken) return null;
      try {
        return jwtDecode(state.accessToken);
      } catch (error) {
        return null;
      }
    },

    userRole: (state) => state.user?.role || null,

    userName: (state) => {
      if (!state.user) return '';
      return state.user.first_name || state.user.email.split('@')[0];
    },

    isTokenExpired: (state, getters) => {
      const tokenData = getters.tokenData;
      if (!tokenData) return true;
      
      const expirationTime = tokenData.exp * 1000; 
      const currentTime = Date.now();
      
      return currentTime >= expirationTime;
    }
  },
  
  actions: {
    async init() {
      if (this.accessToken) {
        await this.fetchUserProfile();

        if (this.user?.role === 'charity') {
          await this.fetchUserCharity();
        }
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;
      this.registerSuccess = false;
      this.registerMessage = '';
      
      try {
        const response = await authApi.register(userData);
        this.registerSuccess = true;
        this.registerMessage = response.data.message || 'Регистрация успешна! Проверьте вашу почту для подтверждения аккаунта.';
        return true;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Ошибка при регистрации';
        console.error('Registration error:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },

async login(credentials) {
  this.loading = true;
  this.error = null;
  
  try {
    const response = await authApi.login(credentials);

    const { access, refresh } = response.data;
    this.accessToken = access;
    this.refreshToken = refresh;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    await this.fetchUserProfile();

    if (this.user?.role === 'charity') {
      await this.fetchUserCharity();
    }

    if (this.user?.role === 'buyer') {
      try {
        const ticketsResponse = await apiClient.get('/auctions/tickets/');
        if (ticketsResponse.data && Array.isArray(ticketsResponse.data)) {
          localStorage.setItem('user_tickets', JSON.stringify(ticketsResponse.data));
          console.log('Загружены билеты пользователя:', ticketsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching user tickets:', err);
      }
    }
    
    return true;
  } catch (error) {
    this.error = error.response?.data?.detail || 'Неверный логин или пароль';
    console.error('Login error:', error);
    return false;
  } finally {
    this.loading = false;
  }
},

async fetchUserProfile() {
  if (!this.accessToken) return;
  
  this.loading = true;
  
  try {
    const response = await authApi.getProfile();
    this.user = response.data;

    if (this.user?.role === 'charity') {
      await this.fetchUserCharity();
    }
  } catch (error) {
    if (error.response?.status === 401) {
      this.logout();
    }
  } finally {
    this.loading = false;
  }
},

async fetchUserCharity() {
  if (!this.accessToken || this.user?.role !== 'charity') return;
  
  this.loading = true;
  
  try {
    const response = await authApi.getUserCharity();
    this.userCharity = response.data;

    if (this.user && this.userCharity) {
      this.user.charity = this.userCharity;
    }
    
    return this.userCharity;
  } catch (error) {

    try {
      const charitiesResponse = await authApi.getCharities();
      const charities = charitiesResponse.data;
      
      if (charities && Array.isArray(charities)) {
        const userCharity = charities.find(c => c.user && c.user.id === this.user.id);
        
        if (userCharity) {
          this.userCharity = userCharity;
          this.user.charity = userCharity;
          return userCharity;
        }
      }
    } catch (err) {
      console.error('Error fetching charities list:', err);
    }
    
    return null;
  } finally {
    this.loading = false;
  }
},

logout() {
  if (this.user && this.user.role === 'buyer') {
    const userId = this.user.id;
    localStorage.setItem('previous_user_id', userId.toString());
  }
  
  this.accessToken = null;
  this.refreshToken = null;
  this.user = null;
  this.userCharity = null;

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
},

updateTokens(accessToken, refreshToken = null) {
  this.accessToken = accessToken;
  
  if (refreshToken) {
    this.refreshToken = refreshToken;
    localStorage.setItem('refresh_token', refreshToken);
  }
  
  localStorage.setItem('access_token', accessToken);
},

resetRegisterState() {
  this.registerSuccess = false;
  this.registerMessage = '';
}
  }
});
