<script setup>
import './FinancePage.scss'
import { Lock } from 'lucide-vue-next'
import { useSidebar } from '../../composables/useSidebar.js'
import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'

const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()
</script>

<template>
  <div class="finance-page">
    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" @toggle="toggleSidebar" />

    <main class="finance-page__content">
      <AppHeader title="Finance" subtitle="Financial overview" @toggle-sidebar="toggleSidebar" />

      <div class="finance-maintenance">
        <div class="finance-maintenance__icon">
          <Lock :size="48" />
        </div>
        <h2 class="finance-maintenance__title">Under Maintenance</h2>
        <p class="finance-maintenance__text">
          The Finance module is currently being set up.<br />
          It will be available soon. Thank you for your patience.
        </p>
        <div class="finance-maintenance__badge">Coming Soon</div>
      </div>
    </main>
  </div>
</template>
