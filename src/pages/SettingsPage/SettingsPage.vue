<script setup>
import './SettingsPage.scss'
import { useRouter } from 'vue-router'
import { Sun, Moon, User, LogOut } from 'lucide-vue-next'
import { useSidebar } from '../../composables/useSidebar.js'
import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import BaseButton from '../../components/common/BaseButton/BaseButton.vue'
import { useThemeStore } from '../../stores/themeStore.js'
import { useAuthStore } from '../../stores/authStore.js'

const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="settings-page">
    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" @toggle="toggleSidebar" />

    <main class="settings-page__content">
      <AppHeader title="Settings" subtitle="Manage your preferences" @toggle-sidebar="toggleSidebar" />

      <div class="settings-section">
        <h3 class="settings-section__title">Appearance</h3>

        <div class="settings-card">
          <div class="settings-row">
            <div class="settings-row__icon">
              <component :is="themeStore.isDark ? Moon : Sun" :size="20" />
            </div>
            <div class="settings-row__body">
              <span class="settings-row__label">Dark Mode</span>
              <span class="settings-row__hint">
                {{ themeStore.isDark ? 'Dark theme is on' : 'Light theme is on' }}
              </span>
            </div>
            <button
              class="theme-toggle"
              :class="{ 'theme-toggle--on': themeStore.isDark }"
              role="switch"
              :aria-checked="themeStore.isDark"
              @click="themeStore.toggle()"
            >
              <span class="theme-toggle__thumb"></span>
            </button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-section__title">Account</h3>

        <div class="settings-card">
          <div class="settings-row">
            <div class="settings-row__icon">
              <User :size="20" />
            </div>
            <div class="settings-row__body">
              <span class="settings-row__label">Signed in as</span>
              <span class="settings-row__hint">{{ authStore.username }}</span>
            </div>
          </div>

          <BaseButton variant="outline-danger" class="settings-logout-btn" @click="handleLogout">
            <LogOut :size="16" /> Logout
          </BaseButton>
        </div>
      </div>
    </main>
  </div>
</template>
