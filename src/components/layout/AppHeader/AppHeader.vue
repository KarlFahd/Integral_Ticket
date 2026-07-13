<script setup>
import './AppHeader.scss'

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, Bell, CircleHelp, LogOut, MessageSquare } from 'lucide-vue-next'
import { useAuthStore } from '../../../stores/authStore.js'
import { useNotificationStore } from '../../../stores/notificationStore.js'
import { useBotStore } from '../../../stores/botStore.js'

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
const notificationStore = useNotificationStore()
const botStore = useBotStore()

const handleMenuClick = () => {
  emit('toggle-sidebar')
}

const handleLogout = () => {
  authStore.logout()
  botStore.reset()
  router.push('/login')
}

// ─── Notifications ────────────────────────────────────────────────────────────

const showNotifications = ref(false)
const bellWrapper = ref(null)

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const handleNotificationClick = async (notification) => {
  showNotifications.value = false
  notificationStore.clear(notification.id)
  const path = authStore.isAdmin ? '/agent-ticket/' : '/ticket/'
  router.push(path + notification.ticketId)
}

const handleClickOutside = (event) => {
  if (bellWrapper.value && !bellWrapper.value.contains(event.target)) {
    showNotifications.value = false
  }
}

onMounted(() => {
  notificationStore.init(authStore.username)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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

      <div class="notif-wrapper" ref="bellWrapper">
        <button
          class="app-header__icon app-header__icon--tooltip"
          data-tooltip="Notifications"
          @click="toggleNotifications"
        >
          <Bell :size="20" />
          <span v-if="notificationStore.unreadCount > 0" class="notif-badge">
            {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
          </span>
        </button>

        <div v-if="showNotifications" class="notif-panel">
          <div class="notif-panel__header">
            <h3>Notifications</h3>
            <span v-if="notificationStore.unreadCount > 0" class="notif-panel__count">
              {{ notificationStore.unreadCount }} new
            </span>
          </div>

          <div class="notif-panel__list">
            <div v-if="notificationStore.notifications.length === 0" class="notif-panel__empty">
              <MessageSquare :size="28" />
              <p>No notifications yet</p>
            </div>

            <button
              v-for="n in notificationStore.notifications"
              :key="n.id"
              class="notif-item"
              @click="handleNotificationClick(n)"
            >
              <span class="notif-item__dot"></span>
              <div class="notif-item__body">
                <span class="notif-item__title">
                  <strong>{{ n.sender }}</strong> {{ n.isAgent ? 'replied on' : 'messaged about' }}
                  <em>{{ n.ticketTitle }}</em>
                </span>
                <span class="notif-item__preview">{{ n.preview }}</span>
                <span class="notif-item__time">{{ n.time }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <button class="app-header__icon app-header__icon--tooltip" data-tooltip="Help" @click="botStore.toggle">
        <CircleHelp :size="20" />
      </button>

      <button class="app-header__icon app-header__icon--tooltip" data-tooltip="Logout" @click="handleLogout">
        <LogOut :size="20" />
      </button>

    </div>

  </header>
</template>
