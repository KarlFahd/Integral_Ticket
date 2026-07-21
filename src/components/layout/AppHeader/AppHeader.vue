<script setup>
import './AppHeader.scss'

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, Bell, CircleHelp, LogOut, MessageSquare } from 'lucide-vue-next'
import { useAuthStore } from '../../../stores/authStore.js'
import { useNotificationStore } from '../../../stores/notificationStore.js'
import { useBotStore } from '../../../stores/botStore.js'
import { useSidebar } from '../../../composables/useSidebar.js'
import BaseIconButton from '../../common/BaseIconButton/BaseIconButton.vue'
import BaseListButton from '../../common/BaseListButton/BaseListButton.vue'

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
const { isSidebarCollapsed } = useSidebar()

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

// ─── Fixed positioning ──────────────────────────────────────────────────────
// The header is `position: fixed` (see .scss) so it never scrolls away, even
// on a very long page. A fixed element takes no space in the page's normal
// flow, so app-header-spacer stands in for it there — sized to whatever the
// header's real rendered height is (title font size, whether a subtitle is
// present, etc. can all vary it), measured live instead of guessed at, so it
// never falls out of sync with what's actually on screen.

const headerEl = ref(null)
const headerHeight = ref(0)
let resizeObserver

onMounted(() => {
  notificationStore.init(authStore.username)
  document.addEventListener('click', handleClickOutside)

  resizeObserver = new ResizeObserver(([entry]) => {
    // entry.contentRect is the header's content box only — it excludes the
    // header's own padding, so the spacer ended up ~32px short and real
    // page content rendered partly underneath the header. offsetHeight is
    // the actual full on-screen box (content + padding + border), which is
    // what the spacer needs to match.
    headerHeight.value = entry.target.offsetHeight
  })
  resizeObserver.observe(headerEl.value)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  resizeObserver?.disconnect()
})
</script>

<template>
  <div class="app-header-spacer" :style="{ height: headerHeight + 'px' }"></div>

  <header
    ref="headerEl"
    class="app-header"
    :class="{ 'app-header--collapsed': isSidebarCollapsed }"
  >

    <div class="app-header__left">

      <BaseIconButton
        class="app-header__menu-button"
        @click="handleMenuClick"
      >
        <Menu :size="28" />
      </BaseIconButton>

      <div class="app-header__title-group">
        <h2>{{ title }}</h2>
        <p v-if="subtitle" class="app-header__subtitle">{{ subtitle }}</p>
      </div>

    </div>

    <div class="app-header__right">

      <div class="notif-wrapper" ref="bellWrapper">
        <BaseIconButton
          class="app-header__icon"
          tooltip="Notifications"
          @click="toggleNotifications"
        >
          <Bell :size="20" />
          <span v-if="notificationStore.unreadCount > 0" class="notif-badge">
            {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
          </span>
        </BaseIconButton>

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

            <BaseListButton
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
            </BaseListButton>
          </div>
        </div>
      </div>

      <BaseIconButton class="app-header__icon" tooltip="Help" @click="botStore.toggle">
        <CircleHelp :size="20" />
      </BaseIconButton>

      <BaseIconButton class="app-header__icon" tooltip="Logout" @click="handleLogout">
        <LogOut :size="20" />
      </BaseIconButton>

    </div>

  </header>
</template>
