<template>
  <div>
    <h2>Đăng nhập</h2>
    <form @submit.prevent="submit">
      <input v-model="username" placeholder="Tên đăng nhập" />
      <input v-model="password" type="password" placeholder="Mật khẩu" />
      <button>Đăng nhập</button>
    </form>
    <p>{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { login } from '../api/auth';
import { useRouter } from 'vue-router';

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

    console.log("✅ Token từ backend:", res.data.token);

    // Lưu token (nếu có)
    localStorage.setItem("token", res.data.token);

    // Chuyển hướng dựa vào vai trò
    if (res.data.role === 'ROLE_ADMIN') {
      router.push('/thu-vien');
    } else {
      router.push('/thu-vien');
    }

  } catch (err) {
    console.error("❌ Đăng nhập thất bại:", err.response?.data || err.message);
  }
};
</script>
