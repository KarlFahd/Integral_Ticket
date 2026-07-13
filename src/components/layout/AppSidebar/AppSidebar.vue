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
  Settings,
  CircleUserRound,
  ShieldCheck,
  PanelLeftClose,
} from 'lucide-vue-next'

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
  <div
    class="app-sidebar__overlay"
    :class="{ 'app-sidebar__overlay--visible': !isCollapsed }"
    @click="$emit('close')"
  ></div>

  <aside class="app-sidebar" :class="{ 'app-sidebar--collapsed': isCollapsed }">

    <div class="app-sidebar__top">

      <div class="app-sidebar__logo">
        <img :src="logoIcon" alt="Logo" />
        <button
          v-if="!isCollapsed"
          class="app-sidebar__collapse-btn"
          @click="$emit('toggle')"
          title="Collapse sidebar"
        >
          <PanelLeftClose :size="18" />
        </button>
      </div>

      <div class="app-sidebar__menu">

        <button
          :class="['app-sidebar__item', { 'app-sidebar__item--active': isActive('/overview') }]"
          data-tooltip="Dashboard"
          @click="router.push('/overview')"
        >
          <House :size="22" />
          <span v-if="!isCollapsed">Dashboard</span>
        </button>

        <button
          :class="['app-sidebar__item', { 'app-sidebar__item--active': isActive('/calendar') }]"
          data-tooltip="Calendar"
          @click="router.push('/calendar')"
        >
          <CalendarDays :size="22" />
          <span v-if="!isCollapsed">Calendar</span>
        </button>

        <button
          v-if="isHr || isAdmin"
          :class="['app-sidebar__item', { 'app-sidebar__item--active': isActive('/users') }]"
          data-tooltip="Users"
          @click="router.push('/users')"
        >
          <Users :size="22" />
          <span v-if="!isCollapsed">Users</span>
        </button>

        <button
          v-if="isHr || isAdmin"
          :class="['app-sidebar__item', { 'app-sidebar__item--active': isActive('/finance') }]"
          data-tooltip="Finance"
          @click="router.push('/finance')"
        >
          <DollarSign :size="22" />
          <span v-if="!isCollapsed">Finance</span>
        </button>

        <button
          :class="['app-sidebar__item', { 'app-sidebar__item--active': isActive(ticketsPath) }]"
          data-tooltip="Tickets"
          @click="router.push(ticketsPath)"
        >
          <Ticket :size="22" />
          <span v-if="!isCollapsed">Tickets</span>
        </button>

      </div>
    </div>

    <div class="app-sidebar__bottom">

      <button
        :class="['app-sidebar__item', { 'app-sidebar__item--active': isActive('/setup-2fa') }]"
        data-tooltip="2FA Setup"
        @click="router.push('/setup-2fa')"
      >
        <ShieldCheck :size="22" />
        <span v-if="!isCollapsed">2FA Setup</span>
      </button>

      <button
        :class="['app-sidebar__item', { 'app-sidebar__item--active': isActive('/settings') }]"
        data-tooltip="Settings"
        @click="router.push('/settings')"
      >
        <Settings :size="22" />
        <span v-if="!isCollapsed">Settings</span>
      </button>

      <button class="app-sidebar__item" data-tooltip="Profile">
        <CircleUserRound :size="22" />
        <span v-if="!isCollapsed">Profile</span>
      </button>

    </div>
  </aside>
</template>
