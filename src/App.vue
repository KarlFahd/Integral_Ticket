<script setup>
import AppToast from './components/common/AppToast/AppToast.vue'
import IntegralBot from './components/bot/IntegralBot/IntegralBot.vue'
import { useAuthStore } from './stores/authStore.js'

const authStore = useAuthStore()
</script>

<template>
  <router-view />
  <AppToast />
  <IntegralBot v-if="authStore.isLoggedIn" />
</template>
