import { createRouter, createWebHistory } from 'vue-router';
import { store } from '../store/billingStore';
import Login from '../features/auth/Login.vue';
import Dashboard from '../features/dashboard/Dashboard.vue';
import InvoiceEngine from '../features/invoice/InvoiceEngine.vue';
import CostAnalytics from '../features/analytics/CostAnalytics.vue';
import MasterTariffs from '../features/master/MasterTariffs.vue';
import MasterUsers from '../features/master/MasterUsers.vue';
import MasterDepartments from '../features/master/MasterDepartments.vue';
import MasterTeams from '../features/master/MasterTeams.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/invoice',
    name: 'Invoice',
    component: InvoiceEngine,
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: CostAnalytics,
    meta: { requiresAuth: true }
  },
  {
    path: '/master-tariffs',
    name: 'MasterTariffs',
    component: MasterTariffs,
    meta: { requiresAuth: true }
  },
  {
    path: '/master-users',
    name: 'MasterUsers',
    component: MasterUsers,
    meta: { requiresAuth: true }
  },
  {
    path: '/master-departments',
    name: 'MasterDepartments',
    component: MasterDepartments,
    meta: { requiresAuth: true }
  },
  {
    path: '/master-teams',
    name: 'MasterTeams',
    component: MasterTeams,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

let isAuthChecked = false;

router.beforeEach(async (to, from, next) => {
  // Jalankan pemeriksaan sesi sekali saja di awal akses aplikasi (pada rute apa pun)
  // untuk mensinkronisasi status autentikasi lokal dengan cookie JWT di backend.
  if (!isAuthChecked) {
    try {
      await store.checkAuth();
    } catch (error) {
      console.error('Initial authentication check failed:', error);
    } finally {
      isAuthChecked = true;
    }
  }

  const isAuthenticated = store.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.guest && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
