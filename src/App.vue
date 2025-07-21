<template>
  
  <router-view></router-view>
</template>


<script>
import Login from './components/Login/Login.vue'
import Register from './components/Login/Register.vue'
import Library from './components/Library/Library.vue'

export default {
  components: { Login, Register,Library },
  data() {
    return {
      view: 'Login'  
    }
  }
}
</script>

<style>
body {
  font-family: 'Segoe UI', sans-serif;
  background: #f4f4f4;
}
#app {
  text-align: center;
  padding: 2rem;
}
.switch-btn {
  margin-bottom: 2rem;
}
.switch-btn button {
  margin: 0 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: #555;
  color: white;
  cursor: pointer;
}
.switch-btn button:hover {
  background: #333;
}
</style>
