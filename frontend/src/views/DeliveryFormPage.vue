<template>
  <div class="delivery-page-container">
    <h1>Оформление доставки</h1>
    <alert-message 
      :show="alertShow" 
      :message="alertMessage" 
      :type="alertType" 
      :auto-hide="true" 
      :duration="5000"
      @close="hideAlert"
    />
    <loading-spinner v-if="loading" text="Загрузка данных..." />
    <div v-if="!loading" class="delivery-content">
      <div v-if="transactionData" class="lot-info">
        <h2>Информация о покупке</h2>
        <div class="info-row">
          <span class="label">Лот:</span>
          <span class="value">{{ transactionData.lot_title || `Лот №${transactionData.lot}` }}</span>
        </div>
        <div class="info-row">
          <span class="label">Сумма:</span>
          <span class="value">{{ formatPrice(transactionData.amount) }}</span>
        </div>
        <div class="info-row">
          <span class="label">Дата оплаты:</span>
          <span class="value">{{ formatDate(transactionData.payment_time) }}</span>
        </div>
      </div>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div class="form-container">
        <form v-if="!success" @submit.prevent="submitForm" class="delivery-form">
          <div class="form-group">
            <label for="recipient_name">ФИО получателя*</label>
            <input 
              type="text" 
              id="recipient_name" 
              v-model="form.recipient_name" 
              required 
              :class="{ 'is-invalid': validation.recipient_name }"
            />
            <div v-if="validation.recipient_name" class="invalid-feedback">
              {{ validation.recipient_name }}
            </div>
          </div>
          
          <div class="form-group">
            <label>Тип доставки*</label>
            <div class="delivery-type-options">
              <label class="delivery-option">
                <input 
                  type="radio" 
                  v-model="form.delivery_type" 
                  value="courier" 
                  name="delivery_type"
                  :class="{ 'is-invalid': validation.delivery_type }"
                />
                <span class="delivery-option-label">Курьером</span>
              </label>
              <label class="delivery-option">
                <input 
                  type="radio" 
                  v-model="form.delivery_type" 
                  value="pickup" 
                  name="delivery_type"
                  :class="{ 'is-invalid': validation.delivery_type }"
                />
                <span class="delivery-option-label">Самовывоз</span>
              </label>
            </div>
            <div v-if="validation.delivery_type" class="invalid-feedback">
              {{ validation.delivery_type }}
            </div>
            <div v-if="form.delivery_type === 'pickup'" class="pickup-info">
               <p class="pickup-address">
                <strong>Адрес самовывоза:</strong> г. Москва, ул. Примерная, д. 123
              </p>
              <p class="pickup-hours">
                <strong>Время работы:</strong> Пн-Пт с 10:00 до 19:00, Сб с 11:00 до 17:00
              </p>
            </div>
          </div>
          
          <div class="form-group" v-if="form.delivery_type === 'courier'">
            <label for="address">Адрес доставки*</label>
            <textarea 
              id="address" 
              v-model="form.address" 
              required 
              rows="3"
              :class="{ 'is-invalid': validation.address }"
            ></textarea>
            <div v-if="validation.address" class="invalid-feedback">
              {{ validation.address }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="delivery_date">Дата доставки*</label>
            <input 
              type="date" 
              id="delivery_date" 
              v-model="form.delivery_date" 
              required
              :min="minDeliveryDate"
              :class="{ 'is-invalid': validation.delivery_date }"
            />
            <div v-if="validation.delivery_date" class="invalid-feedback">
              {{ validation.delivery_date }}
            </div>
            <div class="delivery-date-hint" v-if="form.delivery_type === 'courier'">
              Доставка курьером осуществляется в течение 3-7 рабочих дней
            </div>
            <div class="delivery-date-hint" v-if="form.delivery_type === 'pickup'">
              Самовывоз доступен с указанной даты из пункта выдачи
            </div>
          </div>
          
          <div class="form-group">
            <label for="phone">Телефон*</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="form.phone" 
              required 
              placeholder="+7 (___) ___-__-__"
              :class="{ 'is-invalid': validation.phone }"
            />
            <div v-if="validation.phone" class="invalid-feedback">
              {{ validation.phone }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="comments">Дополнительная информация</label>
            <textarea 
              id="comments" 
              v-model="form.comments" 
              rows="2"
              placeholder="Комментарии к доставке, время получения и т.д."
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="goBack" class="btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
        <div v-if="success" class="success-message">
          <h3>Данные доставки сохранены</h3>
          <p>Информация о доставке успешно сохранена. Вы получите уведомление, когда лот будет отправлен.</p>
          <button @click="goToProfile" class="btn-primary">Вернуться в профиль</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBidStore } from '../store/bidStore';
import { useAuthStore } from '../store/auth';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';

export default {
  name: 'DeliveryFormPage',
  
  components: {
    LoadingSpinner,
    AlertMessage
  },
  
  setup() {
    const route = useRoute();
    const router = useRouter();
    const bidStore = useBidStore();
    const authStore = useAuthStore();
    const loading = ref(false);
    const error = ref('');
    const success = ref(false);
    const alertShow = ref(false);
    const alertMessage = ref('');
    const alertType = ref('info');
    const transactionData = ref(null);
    const transactionId = ref(route.params.id);
    const bidId = ref(route.query.bidId || route.params.bidId || localStorage.getItem('winningBidId'));
    const lotId = ref(route.query.lotId || route.params.lotId || localStorage.getItem('lotId'));
    if (bidId.value && lotId.value) {
      localStorage.removeItem('winningBidId');
      localStorage.removeItem('lotId');
    }
    const form = reactive({
      recipient_name: '',
      address: '',
      phone: '',
      comments: '',
      delivery_type: 'courier',
      delivery_date: ''
    });
    const validation = reactive({
      recipient_name: '',
      address: '',
      phone: '',
      delivery_type: '',
      delivery_date: ''
    });
    const checkAuth = () => {
      if (!authStore.isAuthenticated) {
        router.push({ name: 'login' });
        return false;
      }
      return true;
    };
    const showAlert = (message, type = 'info') => {
      alertMessage.value = message;
      alertType.value = type;
      alertShow.value = true;
    };
    const hideAlert = () => {
      alertShow.value = false;
    };
    const formatDate = (dateString) => {
      if (!dateString) return 'Нет данных';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    const formatPrice = (price) => {
      if (price === null || price === undefined) return 'Нет данных';
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2
      }).format(price);
    };
    const minDeliveryDate = computed(() => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1); 
      return tomorrow.toISOString().split('T')[0]; 
    });
    onMounted(() => {
      const today = new Date();
      const defaultDate = new Date(today);
      defaultDate.setDate(today.getDate() + 3); 
      form.delivery_date = defaultDate.toISOString().split('T')[0];
    });

    const validateTransactionId = () => {
      if (transactionId.value) {
        if (String(transactionId.value).startsWith('sim-')) {
          return true;
        }
        if (isNaN(parseInt(transactionId.value))) {
          showAlert('Некорректный идентификатор транзакции', 'error');
          return false;
        }
        
        return true;
      }
      const storedTransactionId = localStorage.getItem('transactionId');
      if (storedTransactionId) {
        transactionId.value = storedTransactionId;
        localStorage.removeItem('transactionId');
        return validateTransactionId(); 
      }
      showAlert('Не указан идентификатор транзакции', 'error');
      return false;
    };

    const loadTransactionData = async () => {
      if (!checkAuth()) return;
      
      loading.value = true;
      const simulatedPaymentData = localStorage.getItem('simulatedPayment');
      if ((route.query.simulated === 'true' || transactionId.value && String(transactionId.value).startsWith('sim-')) && simulatedPaymentData) {
        try {
          const paymentData = JSON.parse(simulatedPaymentData);
          transactionData.value = {
            id: paymentData.id || ('sim-' + Date.now()),
            lot: paymentData.lotId,
            lot_title: lotId.value ? `Лот №${lotId.value}` : (bidId.value ? `Лот ставки №${bidId.value}` : 'Лот'),
            amount: paymentData.amount || 0,
            payment_time: paymentData.date || new Date().toISOString(),
            status: 'completed',
            simulated: true
          };
          
          localStorage.removeItem('simulatedPayment');
          loading.value = false;
          return;
        } catch (err) {
          console.error('Ошибка при разборе симулированных данных:', err);
        }
      }
      if (!transactionId.value && (bidId.value || lotId.value)) {
        try {
          console.log('Поиск транзакции по', bidId.value ? `bidId=${bidId.value}` : `lotId=${lotId.value}`);
          const winnings = await bidStore.fetchUserWinnings();
          console.log('Получены выигрыши пользователя:', winnings);
          if (winnings && winnings.length > 0) {
            let transaction;
            if (bidId.value) {
              transaction = winnings.find(t => {
                console.log('Проверяем транзакцию:', t);
                return (t.bid_id == bidId.value) || 
                       (t.bid && t.bid.id == bidId.value) || 
                       (t.bid == bidId.value);
              });
            } else if (lotId.value) {
              transaction = winnings.find(t => {
                console.log('Проверяем транзакцию по лоту:', t);
                return t.lot == lotId.value;
              });
            }
            
            if (transaction) {
              console.log('Найдена транзакция по параметрам:', transaction);
              transactionId.value = transaction.id;
              transactionData.value = transaction;
              loading.value = false;
              return;
            } else {
              console.log('Транзакция не найдена по указанным параметрам');
            }
          } else {
            console.log('У пользователя нет выигрышей или список пуст');
          }
        } catch (err) {
          console.error('Ошибка при поиске транзакции:', err);
        }
      }
      if (!validateTransactionId()) {
        loading.value = false;
        return;
      }
      
      try {
        if (transactionId.value && !String(transactionId.value).startsWith('sim-')) {
          const response = await bidStore.fetchTransactionById(transactionId.value);
          if (response) {
            transactionData.value = response;
          } else {
            console.warn('Не удалось получить данные о транзакции по ID:', transactionId.value);
            error.value = 'Не удалось загрузить данные о транзакции';
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных транзакции:', err);
        error.value = 'Ошибка при загрузке данных транзакции. Пожалуйста, попробуйте еще раз.';
      } finally {
        loading.value = false;
      }
    };

    const validateForm = () => {
      let isValid = true;
      Object.keys(validation).forEach(key => {
        validation[key] = '';
      });
      if (!form.recipient_name.trim()) {
        validation.recipient_name = 'ФИО получателя обязательно';
        isValid = false;
      } else if (form.recipient_name.length < 3) {
        validation.recipient_name = 'ФИО должно содержать не менее 3 символов';
        isValid = false;
      }
      if (!form.delivery_type) {
        validation.delivery_type = 'Выберите тип доставки';
        isValid = false;
      }
      if (form.delivery_type === 'courier') {
        if (!form.address.trim()) {
          validation.address = 'Адрес доставки обязателен';
          isValid = false;
        } else if (form.address.length < 10) {
          validation.address = 'Адрес должен содержать не менее 10 символов';
          isValid = false;
        }
      }
      if (!form.delivery_date) {
        validation.delivery_date = 'Дата доставки обязательна';
        isValid = false;
      } else {
        const today = new Date();
        const selectedDate = new Date(form.delivery_date);
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          validation.delivery_date = 'Дата доставки не может быть в прошлом';
          isValid = false;
        }
      }
      if (!form.phone.trim()) {
        validation.phone = 'Телефон обязателен';
        isValid = false;
      } else {
        const phoneRegex = /^(\+7|8)[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        if (!phoneRegex.test(form.phone)) {
          validation.phone = 'Неверный формат телефона';
          isValid = false;
        }
      }
      
      return isValid;
    };
    const submitForm = async () => {
      if (!validateForm()) return;
      
      loading.value = true;
      error.value = '';
      
      try {
        if (transactionData.value && transactionData.value.simulated) {
          setTimeout(() => {
            success.value = true;
            showAlert('Данные доставки успешно сохранены!', 'success');
            loading.value = false;
          }, 1000);
          
          return;
        }
        if (!transactionId.value || String(transactionId.value).startsWith('sim-')) {
          error.value = 'Не удается идентифицировать транзакцию для сохранения доставки';
          loading.value = false;
          return;
        }
        const deliveryData = {
          transaction: transactionId.value, 
          recipient_name: form.recipient_name,
          phone: form.phone,
          delivery_type: form.delivery_type,
          delivery_date: form.delivery_date,
          comments: form.comments || ''
        };
        if (form.delivery_type === 'courier') {
          deliveryData.address = form.address;
        } else {
          deliveryData.address = 'Самовывоз из офиса: г. Москва, ул. Примерная, д. 123';
        }
        
        console.log('Отправка данных доставки для транзакции ID:', transactionId.value);
        console.log('Данные доставки:', deliveryData);
        const response = await bidStore.saveDeliveryDetails(transactionId.value, deliveryData);
        
        if (response) {
          bidStore.updateWinningDeliveryStatus(transactionId.value, deliveryData);
          
          success.value = true;
          showAlert('Данные доставки успешно сохранены!', 'success');
          setTimeout(() => {
            bidStore.fetchUserWinnings();
          }, 2000);
        } else {
          error.value = bidStore.error || 'Ошибка при сохранении данных доставки';
        }
      } catch (err) {
        console.error('Ошибка при сохранении данных доставки:', err);
        error.value = err.message || 'Произошла ошибка при сохранении данных доставки';
      } finally {
        loading.value = false;
      }
    };
    const goBack = () => {
      router.back();
    };
    const goToProfile = () => {
      router.push('/profile');
    };
    onMounted(() => {
      console.log('DeliveryFormPage mounted');
      console.log('Route params:', route.params);
      console.log('Route query:', route.query);
      console.log('bidId:', bidId.value);
      console.log('lotId:', lotId.value);
      console.log('transactionId:', transactionId.value);
      console.log('Данные в localStorage при инициализации страницы доставки:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`${key}: ${localStorage.getItem(key)}`);
      }
      if (bidId.value && lotId.value) {
        console.log('Starting delivery form without payment processing...');
        if (authStore.user) {
          form.recipient_name = authStore.user.first_name && authStore.user.last_name ? 
            `${authStore.user.first_name} ${authStore.user.last_name}` : 
            authStore.user.username || '';
        }
        loadTransactionData();
      } else if (transactionId.value) {
        console.log('Loading transaction data for existing transaction...');
        loadTransactionData();
      } else {
        console.log('Insufficient data for delivery processing');
        showAlert('Недостаточно данных для оформления доставки', 'error');
        router.push('/profile');
      }
    });
    
    return {
      loading,
      error,
      success,
      alertShow,
      alertMessage,
      alertType,
      transactionData,
      form,
      validation,
      formatDate,
      formatPrice,
      submitForm,
      goBack,
      goToProfile,
      hideAlert
    };
  }
}
</script>

<style scoped>
.delivery-page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

h1 {
  margin-bottom: 24px;
  color: #333;
  text-align: center;
}

h2 {
  margin-bottom: 16px;
  color: #555;
  font-size: 1.2rem;
}

.delivery-content {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.lot-info {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.label {
  font-weight: 500;
  color: #666;
  width: 140px;
  padding-right: 16px;
}

.value {
  color: #333;
  flex-grow: 1;
}

.error-message {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.form-container {
  padding: 10px 0;
}

.delivery-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

input,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus,
textarea:focus {
  border-color: #007bff;
  outline: none;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0069d9;
}

.btn-primary:disabled {
  background-color: #6c9bd9;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.success-message {
  text-align: center;
  padding: 16px;
}

.success-message h3 {
  color: #28a745;
  margin-bottom: 16px;
}

.success-message p {
  margin-bottom: 24px;
  color: #495057;
}

@media (max-width: 576px) {
  .delivery-page-container {
    padding: 16px;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .label {
    width: 100%;
    margin-bottom: 4px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}

.delivery-type-options {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.delivery-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
}

.delivery-option-label {
  margin-left: 8px;
}

.pickup-info {
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 12px;
  border-left: 3px solid #007bff;
}

.pickup-address, .pickup-hours {
  margin: 6px 0;
  font-size: 14px;
}

.delivery-date-hint {
  font-size: 13px;
  color: #6c757d;
  margin-top: 4px;
}

input[type="date"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}
</style> 