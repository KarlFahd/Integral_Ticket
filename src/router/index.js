import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const routes = [
  { path: '/', redirect: '/login' },

  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
  },

  {
    path: '/overview',
    name: 'Overview',
    component: () => import('../pages/OverviewPage/OverviewPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../pages/CalendarPage/CalendarPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/setup-2fa',
    name: 'Setup2FA',
    component: () => import('../pages/Setup2FAPage/Setup2FAPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/SettingsPage/SettingsPage.vue'),
    meta: { requiresAuth: true },
  },

  // HR only
  {
    path: '/users',
    name: 'Users',
    component: () => import('../pages/UsersPage/UsersPage.vue'),
    meta: { requiresAuth: true, requiresHr: true },
  },
  {
    path: '/finance',
    name: 'Finance',
    component: () => import('../pages/FinancePage/FinancePage.vue'),
    meta: { requiresAuth: true, requiresHr: true },
  },

  // Employee ticket pages
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/ClientDashboardPage/ClientDashboardPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: false },
  },
  {
    path: '/create-ticket',
    name: 'CreateTicket',
    component: () => import('../pages/CreateTicketPage/CreateTicketPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: false },
  },
  {
    path: '/ticket/:id',
    name: 'TicketDetail',
    component: () => import('../pages/TicketDetailPage/TicketDetailPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: false },
  },

  // Agent ticket pages
  {
    path: '/agent-dashboard',
    name: 'AgentDashboard',
    component: () => import('../pages/AgentDashboardPage/AgentDashboardPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/agent-ticket/:id',
    name: 'AgentTicketDetail',
    component: () => import('../pages/AgentTicketDetailPage/AgentTicketDetailPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../pages/HistoryPage/HistoryPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (!to.meta.requiresAuth) return next()
  if (!authStore.isLoggedIn) return next('/login')

  if (to.meta.requiresHr && !authStore.isHr && !authStore.isAdmin) {
    return next('/overview')
  }

  if ('requiresAdmin' in to.meta) {
    if (to.meta.requiresAdmin && !authStore.isAdmin) return next('/overview')
    if (!to.meta.requiresAdmin && authStore.isAdmin) return next('/agent-dashboard')
  }

  next()
})

export default router
