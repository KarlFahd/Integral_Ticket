<script setup>
import './AppHeader.scss'

import { useRouter } from 'vue-router'
import { Menu, Bell, CircleHelp, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '../../../stores/authStore.js'

defineProps({
  title: {
    type: String,
    default: 'Support Ticket',
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore()

const handleMenuClick = () => {
  emit('toggle-sidebar')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="app-header">

    <div class="app-header__left">

      <button
        class="app-header__menu-button"
        @click="handleMenuClick"
      >
        <Menu :size="28" />
      </button>

      <div class="app-header__title-group">
        <h2>{{ title }}</h2>
        <p v-if="subtitle" class="app-header__subtitle">{{ subtitle }}</p>
      </div>

    </div>

    <div class="app-header__right">

      <button class="app-header__icon">
        <Bell :size="20" />
      </button>

      <button class="app-header__icon">
        <CircleHelp :size="20" />
      </button>

      <button class="app-header__icon" @click="handleLogout">
        <LogOut :size="20" />
      </button>

    </div>

  </header>
</template>
