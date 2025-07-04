<template>

<h1>chào {{ username }}</h1>
<div>
  <button @click="logOut">Logout</button>
</div>
</template>
<script setup>

import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { ref, onMounted } from 'vue';
import axios from 'axios';

    const router = useRouter()
    const toast = useToast()
    const username = ref('')

    const logOut = async()=>{
      try{
        await axios.post('http://localhost:8080/tai-khoan/logout', {},{ withCredentials: true })
        localStorage.removeItem('token')
        router.push('/login')
      }catch(error){
        console.error('logout faild:', error)
      }
    }

    onMounted(() => {
      const msg = sessionStorage.getItem('message')
      const name  = sessionStorage.getItem('user')
      if (msg) {
        toast.success(msg)
        sessionStorage.removeItem('message')
      }
      if(name){
        username.value = name 
      }
    })
</script>   