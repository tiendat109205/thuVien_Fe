import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/components/Login/Login.vue';
import Library from '@/components/Library/Library.vue';
import Customer from '@/components/Library/Customer.vue';
import LoanVoucher from '@/components/Library/LoanVoucher.vue';
import Unauthorized from '@/components/Login/Unauthorized.vue';
import Register from '@/components/Login/Register.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },

  { path: '/register', component: Register },
  {
    path: '/thu-vien',
    component: Library,
    meta: { requiresAuth: true, roles: ['ROLE_ADMIN', 'ROLE_USER'] }
  },
  {
    path: '/phieu-muon',
    component: LoanVoucher,
    meta: { requiresAuth: true, roles: ['ROLE_ADMIN','ROLE_ADMIN'] }
  },
  {
    path: '/khach-hang',
    component: Customer,
    meta: { requiresAuth: true, roles: ['ROLE_USER','ROLE_ADMIN'] }
  },

  { path: '/unauthorized', component: Unauthorized },
];


const router = createRouter({
  history: createWebHistory(),
  routes
});

// ✅ Middleware kiểm tra xác thực & phân quyền
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // "ROLE_ADMIN", "ROLE_USER"
  const requiresAuth = to.meta.requiresAuth || false;
  const allowedRoles = to.meta.roles || [];

  if (requiresAuth && !token) {
    return next('/login');
  }

  if (requiresAuth && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return next('/unauthorized');
  }

  next();
});

export default router;
