<template>
  <PhieuMuon :reloadKey="reloadKey"/>
  <KhachHang @sauKhiTraSach="reloadDuLieu"/>
</template>

<script setup>
import PhieuMuon from './PhieuMuon.vue'
import KhachHang from './KhachHang.vue'
import { ref } from 'vue'

const reloadKey = ref(0)

function reloadDuLieu() {
  reloadKey.value++
}
</script>

<style scoped>
</style>
