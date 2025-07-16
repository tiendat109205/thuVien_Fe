<template>
  <div class="container">
    <h2>Đăng nhập</h2>
    <form @submit.prevent="submit">
      <input v-model="username" placeholder="Tên đăng nhập" type="text"/>
      <input v-model="password" type="password" placeholder="Mật khẩu"/>
      <button>Đăng nhập</button>
    </form>
    <p class="link">
      Chưa có tài khoản?
      <router-link to="/register">Đăng ký tại đây</router-link>
    </p>
    <p>{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { login } from '../api/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

const toast = useToast();
const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const submit = async () => {
  try {
    const res = await login({
      tenDangNhap: username.value,
      matKhau: password.value
    });

    console.log("Token từ backend:", res.data.token);

    console.log("userId lưu vào localStorage:", res.data.id);
    const role = res.data.vaiTro;
    console.log(role)
      router.push('/thu-vien');
      toast.success("Đăng nhập thành công với: "+role)
  } catch (err) {
    console.error("Đăng nhập thất bại:", err.response?.data || err.message);
    toast.error(err.response?.data || "Sai tên đăng nhập hoặc mật khẩu")
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
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  flex:1;
  cursor: pointer;
}

button:hover {
  background: #2980b9;
}
.error {
  color: red;
}
.success {
  color: green;
}
</style>
