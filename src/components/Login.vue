<template>
    <div class="form-container">
    <h2>Đăng Nhập</h2>
    <form @submit.prevent="login">
      <input type="text" placeholder="Tên tài khoản" v-model="username" />
      <input type="password" placeholder="Mật khẩu" v-model="password" />
        <button type="submit">Đăng nhập</button>
    </form>
    <!-- <GoogleLogin @success="onGoogleSuccess" @error="onGoogleError" /> -->
    <p class="link">
      Chưa có tài khoản?
      <router-link to="/register">Đăng ký tại đây</router-link>
    </p>
  </div>
</template>

<script>
import axios from 'axios'
import { ref, onMounted } from 'vue'
// import { GoogleLogin } from 'vue3-google-login'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

export default {
  // components: { GoogleLogin },
  setup() {
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const toast = useToast()
    const router = useRouter()

    onMounted(() => {
      const msg = sessionStorage.getItem('message')
      if (msg) {
        toast.success(msg)
        sessionStorage.removeItem('message')
      }
    })

    const login = async () => {
      error.value = ''
      if (!username.value || !password.value) {
        error.value = 'Hãy nhập đủ thông tin!';
        toast.error(error.value);
        return
      }
      try {
        const res = await axios.post('http://localhost:8080/tai-khoan/login', {
          tenTaiKhoan: username.value,
          matKhau: password.value
        })
        sessionStorage.setItem('message', 'Đăng nhập thành công') 
        sessionStorage.setItem('user', res.data.tenTaiKhoan)
        router.push('/home') 
      } catch (err) {
        const message = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message;
        toast.error(message);
      }
    }

    // const onGoogleSuccess = (response) => {
    //   const idToken = response.credential
    //   axios.post('http://localhost:8080/tai-khoan/login-google', {
    //      id_token: idToken 
    //     })
    //     .then(res => {
    //       sessionStorage.setItem('message', 'Đăng nhập Google thành công!')
    //       sessionStorage.setItem('user', res.data.tenTaiKhoan)
    //       router.push('/home')
    //     })
    //     .catch(() => {
    //       error.value = 'Đăng nhập Google thất bại!'
    //     })
    // }

    // const onGoogleError = () => {
    //   error.value = 'Đăng nhập Google thất bại!'
    // }

    return {
      username,
      password,
      error,
      login,
      // onGoogleSuccess,
      // onGoogleError
    }
  }
}
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
