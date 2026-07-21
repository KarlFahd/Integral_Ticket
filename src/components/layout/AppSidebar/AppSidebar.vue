<script setup>
import './AppSidebar.scss'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/authStore.js'
import logoIcon from '../../../assets/images/logo-icon.png.png'
import {
  House,
  CalendarDays,
  Users,
  DollarSign,
  Ticket,
  History,
  Settings,
  CircleUserRound,
  ShieldCheck,
  PanelLeftClose,
} from 'lucide-vue-next'
import AppSidebarItem from './AppSidebarItem.vue'
import BaseIconButton from '../../common/BaseIconButton/BaseIconButton.vue'

defineProps({ isCollapsed: { type: Boolean, default: false } })
defineEmits(['close', 'toggle'])

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()
const { isAdmin, isHr } = storeToRefs(authStore)

const ticketsPath = computed(() => isAdmin.value ? '/agent-dashboard' : '/dashboard')

const isActive = (path) => route.path === path || route.path.startsWith(path + '/')
</script>

<template>
  <!-- Reserves the sidebar's width in the page's flex row — the actual
       sidebar below is `position: fixed` and no longer does that itself. -->
  <div class="app-sidebar-spacer" :class="{ 'app-sidebar-spacer--collapsed': isCollapsed }"></div>

  <div
    class="app-sidebar__overlay"
    :class="{ 'app-sidebar__overlay--visible': !isCollapsed }"
    @click="$emit('close')"
  ></div>

  <aside class="app-sidebar" :class="{ 'app-sidebar--collapsed': isCollapsed }">

    <div class="app-sidebar__top">

      <div class="app-sidebar__logo">
        <img :src="logoIcon" alt="Logo" />
        <BaseIconButton
          v-if="!isCollapsed"
          class="app-sidebar__collapse-btn"
          tooltip="Collapse sidebar"
          @click="$emit('toggle')"
        >
          <PanelLeftClose :size="18" />
        </BaseIconButton>
      </div>

      <div class="app-sidebar__menu">

        <AppSidebarItem
          :icon="House"
          label="Dashboard"
          :active="isActive('/overview')"
          :collapsed="isCollapsed"
          @click="router.push('/overview')"
        />

        <AppSidebarItem
          :icon="CalendarDays"
          label="Calendar"
          :active="isActive('/calendar')"
          :collapsed="isCollapsed"
          @click="router.push('/calendar')"
        />

        <AppSidebarItem
          v-if="isHr || isAdmin"
          :icon="Users"
          label="Users"
          :active="isActive('/users')"
          :collapsed="isCollapsed"
          @click="router.push('/users')"
        />

        <AppSidebarItem
          v-if="isHr || isAdmin"
          :icon="DollarSign"
          label="Finance"
          :active="isActive('/finance')"
          :collapsed="isCollapsed"
          @click="router.push('/finance')"
        />

        <AppSidebarItem
          :icon="Ticket"
          label="Tickets"
          :active="isActive(ticketsPath)"
          :collapsed="isCollapsed"
          @click="router.push(ticketsPath)"
        />

        <AppSidebarItem
          v-if="isAdmin"
          :icon="History"
          label="History"
          :active="isActive('/history')"
          :collapsed="isCollapsed"
          @click="router.push('/history')"
        />

      </div>
    </div>

    <div class="app-sidebar__bottom">

      <AppSidebarItem
        :icon="ShieldCheck"
        label="2FA Setup"
        :active="isActive('/setup-2fa')"
        :collapsed="isCollapsed"
        @click="router.push('/setup-2fa')"
      />

      <AppSidebarItem
        :icon="Settings"
        label="Settings"
        :active="isActive('/settings')"
        :collapsed="isCollapsed"
        @click="router.push('/settings')"
      />

      <AppSidebarItem
        :icon="CircleUserRound"
        label="Profile"
        :collapsed="isCollapsed"
      />

    </div>
  </aside>
</template>
