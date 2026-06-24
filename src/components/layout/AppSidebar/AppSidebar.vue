<script setup>
import './AppSidebar.scss'

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

import logoIcon from '../../../assets/images/logo-icon.png.png'

import {
  House,
  CalendarDays,
  Users,
  DollarSign,
  Ticket,
  Settings,
  CircleUserRound,
} from 'lucide-vue-next'
</script>

<template>
  <div
    class="app-sidebar__overlay"
    :class="{ 'app-sidebar__overlay--visible': !isCollapsed }"
    @click="$emit('close')"
  ></div>

  <aside
    class="app-sidebar"
    :class="{ 'app-sidebar--collapsed': isCollapsed }"
  >
    <div class="app-sidebar__top">

      <div class="app-sidebar__logo">
        <img :src="logoIcon" alt="Logo" />
      </div>

      <div class="app-sidebar__menu">

        <button class="app-sidebar__item">
          <House :size="22" />
          <span v-if="!isCollapsed">Dashboard</span>
        </button>

        <button class="app-sidebar__item">
          <CalendarDays :size="22" />
          <span v-if="!isCollapsed">Calendar</span>
        </button>

        <button class="app-sidebar__item">
          <Users :size="22" />
          <span v-if="!isCollapsed">Users</span>
        </button>

        <button class="app-sidebar__item">
          <DollarSign :size="22" />
          <span v-if="!isCollapsed">Finance</span>
        </button>

        <button class="app-sidebar__item app-sidebar__item--active">
          <Ticket :size="22" />
          <span v-if="!isCollapsed">Tickets</span>
        </button>

      </div>
    </div>

    <div class="app-sidebar__bottom">

      <button class="app-sidebar__item">
        <Settings :size="22" />
        <span v-if="!isCollapsed">Settings</span>
      </button>

      <button class="app-sidebar__item">
        <CircleUserRound :size="22" />
        <span v-if="!isCollapsed">Profile</span>
      </button>

    </div>
  </aside>
</template>
