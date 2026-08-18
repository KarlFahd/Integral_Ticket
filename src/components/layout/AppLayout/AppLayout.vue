<script setup>
import { useSidebar } from '../../../composables/useSidebar.js'
import AppSidebar from '../AppSidebar/AppSidebar.vue'
import AppHeader from '../AppHeader/AppHeader.vue'

defineProps({
  title: { type: String, default: 'Support Ticket' },
  subtitle: { type: String, default: '' },
  contentClass: { type: String, default: '' },
})

const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()
</script>

<template>
  <div>
    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" @toggle="toggleSidebar" />

    <main :class="contentClass">
      <AppHeader :title="title" :subtitle="subtitle" @toggle-sidebar="toggleSidebar" />
      <slot />
    </main>
  </div>
</template>
