<template>
  <LoanVoucher :reloadKey="reloadKey" @reloadCustomer="reloadDuLieu"/>
  <Customer :reloadKey="reloadKey" @afterReturnBook="reloadDuLieu"/>
</template>

<script setup>
import LoanVoucher from './LoanVoucher.vue';
import Customer from './Customer.vue';
import { ref } from 'vue';

const reloadKey = ref(0);

function reloadDuLieu() {
  reloadKey.value++;
}
</script>

<style scoped>
</style>
