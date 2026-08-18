<script setup>
import './FinancePage.scss'
import { Lock } from 'lucide-vue-next'
import AppLayout from '../../components/layout/AppLayout/AppLayout.vue'
</script>

<template>
  <AppLayout
    class="finance-page"
    content-class="finance-page__content"
    title="Finance"
    subtitle="Financial overview"
  >
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
  </AppLayout>
</template>
