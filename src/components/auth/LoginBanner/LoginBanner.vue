<script setup>
import './LoginBanner.scss'

import {
  Ticket,
  Clock3,
  BarChart3,
  Monitor,
} from 'lucide-vue-next'
</script>

<template>
  <div class="login-banner">
    <h2 class="login-banner__title">
      Welcome <span>Back !</span>
    </h2>

    <p class="login-banner__description">
      Sign in to your account to continue managing and tracking your tickets.
    </p>

    <div class="login-banner__illustration">
      <Monitor :size="180" />
    </div>

    <div class="login-banner__features">
      <Ticket :size="32" />
      <Clock3 :size="32" />
      <BarChart3 :size="32" />
    </div>
  </div>
</template>