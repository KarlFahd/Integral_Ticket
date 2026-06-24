<script setup>
import logoIcon from '../assets/images/logo-icon.png.png'
import LoginBanner from '../components/auth/LoginBanner/LoginBanner.vue'
import LoginForm from '../components/auth/LoginForm/LoginForm.vue'
import './LoginPage/LoginPage.scss'
</script>

<template>
  <div class="login-page">

    <div class="login-logo">
      <img
        :src="logoIcon"
        alt="Integral Logo"
      />

      <div class="login-logo__text">
        <h2>Integral</h2>
        <p>Support Portal</p>
      </div>
    </div>

    <div class="login-card">

      <div class="left-panel">
        <LoginBanner />
      </div>

      <div class="right-panel">
        <LoginForm />
      </div>

    </div>

  </div>
</template>
