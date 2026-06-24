import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue')
  },

  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () =>
      import('../pages/ClientDashboardPage/ClientDashboardPage.vue')
  },

  {
    path: '/create-ticket',
    name: 'CreateTicket',
    component: () =>
      import('../pages/CreateTicketPage/CreateTicketPage.vue')
  },

  {
    path: '/ticket/:id',
    name: 'TicketDetail',
    component: () =>
      import('../pages/TicketDetailPage/TicketDetailPage.vue')
  },

  {
    path: '/agent-dashboard',
    name: 'AgentDashboard',
    component: () =>
      import('../pages/AgentDashboardPage/AgentDashboardPage.vue')
  },

  {
    path: '/agent-ticket/:id',
    name: 'AgentTicketDetail',
    component: () =>
      import('../pages/AgentTicketDetailPage/AgentTicketDetailPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.path !== '/login' && !authStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
