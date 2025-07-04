import { createRouter, createWebHistory } from 'vue-router'
import Register from '@/components/Login/Register.vue'
import Login from '@/components/Login/Login.vue'
import Home from '@/components/Login/Home.vue'
import ThuVien from '@/components/QuanLySach/ThuVien.vue'
const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Home },
  { path: '/thu-vien', component: ThuVien},
  { path: '/', redirect: '/thu-vien' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
