<template>
    <div class="form-container">
    <h2>Đăng Ký</h2>
    <form @submit.prevent="register">
      <input type="text" placeholder="Tên tài khoản" v-model="username" />
      <input type="text" placeholder="Họ tên" v-model="fullName" />
      <input type="email" placeholder="Email" v-model="email" />
      <input type="password" placeholder="Mật khẩu" v-model="password" />
      <input type="password" placeholder="Nhập lại mật khẩu" v-model="confirmPassword" />
      <button type="submit">Đăng ký</button>
    </form>
    <p class="link">
      Đã có tài khoản?
      <router-link to="/login">Đăng nhập tại đây</router-link>
    </p>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const username = ref('');
const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref('');

const router = useRouter();
const toast = useToast();

const register = async () => {
  error.value = '';
  success.value = '';

  if (!username.value || !fullName.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Vui lòng điền đầy đủ thông tin!';
    toast.error(error.value);
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Mật khẩu không khớp!';
    toast.error(error.value);
    return;
  }

  try {
    const res = await axios.post('http://localhost:8080/tai-khoan/register', {
      tenTaiKhoan: username.value,
      hoTen: fullName.value,
      email: email.value,
      matKhau: password.value
    });

    sessionStorage.setItem('message', 'Đăng ký thành công');
    router.push('/login');
  } catch (err) { 
    const message =
      typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
    toast.error(message);
  }
};
</script>


<style scoped>
.form-container {
  max-width: 350px;
  margin: auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: white;
}
input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
button {
  width: 100%;
  padding: 10px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
button:hover {
  background: #27ae60;
}
.error {
  color: red;
}
.success {
  color: green;
}
</style>
