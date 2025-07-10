import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/components/Login/Login.vue';
import ThuVien from '@/components/QuanLySach/ThuVien.vue';
import KhachHang from '@/components/QuanLySach/KhachHang.vue';
import PhieuMuon from '@/components/QuanLySach/PhieuMuon.vue';
import Unauthorized from '@/components/Login/Unauthorized.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },

  {
    path: '/thu-vien',
    component: ThuVien,
    meta: { requiresAuth: true, roles: ['ROLE_ADMIN', 'ROLE_USER'] }
  },
  {
    path: '/phieu-muon',
    component: PhieuMuon,
    meta: { requiresAuth: true, roles: ['ROLE_ADMIN','ROLE_ADMIN'] }
  },
  {
    path: '/khach-hang',
    component: KhachHang,
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
