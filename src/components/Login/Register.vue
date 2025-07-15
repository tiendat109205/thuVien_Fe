<template>
  <div class="container">
    <h2>Đăng ký</h2>
    <form @submit.prevent="submit">
      <input v-model="username" placeholder="Tên đăng nhập" required type="text"/>
      <input v-model="password" type="password" placeholder="Mật khẩu" required />
      <button>Đăng ký</button>
    </form>
    <p class="link">
      Đã có tài khoản?
      <router-link to="/login">Đăng nhập tại đây</router-link>
    </p>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { register } from '../api/auth';
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router';

const toast = useToast()
const username = ref('');
const password = ref('');
const message = ref('');
const router = useRouter();

const submit = async () => {
  try {
    await register({
      tenDangNhap: username.value,
      matKhau: password.value
      // Không cần gửi vaiTro
    }); 
    router.push("/login")
    toast.success("Đăng ký thành công")
    username.value = '';
    password.value = '';
  } catch (err) {
    toast.error(err.response?.data)
  }
};
</script>
<style scoped>
.container {
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