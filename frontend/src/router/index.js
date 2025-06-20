import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { useAuthStore } from '../store/auth'

const base = '/'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/auctions',
    name: 'auctions',
    component: () => import('../views/Auctions.vue')
  },
  {
    path: '/auctions/:id',
    name: 'auction-detail',
    component: () => import('../views/AuctionDetail.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-lot',
    name: 'create-lot',
    component: () => import('../views/CreateLot.vue'),
    meta: { requiresAuth: true, requiredRole: 'donor' }
  },
  {
    path: '/lots/:id',
    name: 'lot',
    component: () => import('../views/LotDetail.vue'),
    props: true
  },
  {
    path: '/charity',
    name: 'charity',
    component: () => import('../views/Charity.vue')
  },
  {
    path: '/stories',
    name: 'stories',
    component: () => import('../views/Stories.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue')
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: () => import('../views/Contacts.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/delivery/:id',
    name: 'delivery',
    component: () => import('../views/DeliveryFormPage.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/delivery-form',
    name: 'delivery-form',
    component: () => import('../views/DeliveryFormPage.vue'),
    props: route => ({ 
      bidId: route.query.bidId,
      lotId: route.query.lotId
    }),
    meta: { requiresAuth: true }
  },
  {
    path: '/payment',
    name: 'payment',
    component: () => import('../views/PaymentPage.vue'),
    props: route => ({ 
      bidId: route.query.bidId,
      lotId: route.query.lotId
    }),
    meta: { requiresAuth: true }
  },
  {
    path: '/create-auction',
    name: 'create-auction',
    component: () => import('../views/CreateAuction.vue'),
    meta: { requiresAuth: true, requiredRole: 'charity' }
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(base),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  console.log('Navigating to route:', to.path, to.query);
  
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      next({ name: 'login' })
      return
    }
    
    if (to.meta.requiredRole && authStore.user?.role !== to.meta.requiredRole) {
      console.log('User role mismatch:', authStore.user?.role, to.meta.requiredRole);
      next({ name: from.name || 'home' })
      return
    }
  }

  next()
})

export default router