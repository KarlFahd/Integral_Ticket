<script setup>
import './SettingsPage.scss'
import { useRouter } from 'vue-router'
import { Sun, Moon, User, LogOut } from 'lucide-vue-next'
import AppLayout from '../../components/layout/AppLayout/AppLayout.vue'
import BaseButton from '../../components/common/BaseButton/BaseButton.vue'
import { useThemeStore } from '../../stores/themeStore.js'
import { useAuthStore } from '../../stores/authStore.js'

const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <AppLayout
    class="settings-page"
    content-class="settings-page__content"
    title="Settings"
    subtitle="Manage your preferences"
  >
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
  </AppLayout>
</template>
