<template>
  <div>
    <h2>Đăng ký</h2>
    <form @submit.prevent="submit">
      <input v-model="username" placeholder="Tên đăng nhập" required />
      <input v-model="password" type="password" placeholder="Mật khẩu" required />
      <button>Đăng ký</button>
    </form>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { register } from '../api/auth';

const username = ref('');
const password = ref('');
const message = ref('');

const submit = async () => {
  try {
    await register({
      tenDangNhap: username.value,
      matKhau: password.value
      // Không cần gửi vaiTro
    });
    message.value = '✅ Đăng ký thành công!';
    username.value = '';
    password.value = '';
  } catch (err) {
    message.value = '❌ Đăng ký thất bại: ' + err.response?.data || 'Lỗi không xác định';
  }
};
</script>
