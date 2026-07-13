<script setup>
import './OverviewPage.scss'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebar } from '../../composables/useSidebar.js'
import { Ticket, CheckCircle2, Clock, AlertCircle, Plus, ArrowRight } from 'lucide-vue-next'
import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import SkeletonLoader from '../../components/common/SkeletonLoader/SkeletonLoader.vue'
import { useTicketStore } from '../../stores/ticketStore.js'
import { useAuthStore }   from '../../stores/authStore.js'
import { storeToRefs }    from 'pinia'

const router    = useRouter()
const store     = useTicketStore()
const authStore = useAuthStore()
const { isLoading } = storeToRefs(store)
onMounted(() => store.fetchTickets())

const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()

const allTickets = computed(() => store.tickets ?? [])

const myTickets = computed(() =>
  authStore.isAdmin
    ? allTickets.value
    : allTickets.value.filter(t => t.createdBy.toLowerCase() === authStore.username.toLowerCase())
)

const stats = computed(() => ({
  total:      myTickets.value.length,
  open:       myTickets.value.filter(t => t.status === 'Open').length,
  inProgress: myTickets.value.filter(t => t.status === 'In Progress').length,
  resolved:   myTickets.value.filter(t => t.status === 'Resolved' || t.status === 'Approved').length,
}))

const categories = ['Hardware', 'Software', 'Network', 'Account']
const byCategory = computed(() =>
  categories.map(cat => ({
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: myTickets.value.filter(t => t.category === cat).length,
  }))
)
const maxCatCount = computed(() => Math.max(...byCategory.value.map(c => c.count), 1))

const recent = computed(() =>
  [...myTickets.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
)

const STAT_CARDS = computed(() => [
  { label: 'Total Tickets',  value: stats.value.total,      icon: Ticket,       color: 'primary'  },
  { label: 'Open',           value: stats.value.open,       icon: AlertCircle,  color: 'warning'  },
  { label: 'In Progress',    value: stats.value.inProgress, icon: Clock,        color: 'info'     },
  { label: 'Resolved',       value: stats.value.resolved,   icon: CheckCircle2, color: 'success'  },
])

const statusVariant = (status) => {
  const map = { Open: 'warning', 'In Progress': 'info', Resolved: 'success', Approved: 'success', Rejected: 'danger', Pending: 'warning' }
  return map[status] ?? 'default'
}

const goToTickets = () => router.push(authStore.isAdmin ? '/agent-dashboard' : '/dashboard')
</script>

<template>
  <div class="overview-page">
    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" @toggle="toggleSidebar" />

    <main class="overview-page__content">
      <AppHeader title="Overview" subtitle="Welcome back to your portal" @toggle-sidebar="toggleSidebar" />

      <!-- Greeting -->
      <div class="overview-greeting">
        <div>
          <h2 class="overview-greeting__name">Hello, {{ authStore.user?.name }}</h2>
          <p class="overview-greeting__sub">Here's what's happening with your tickets today.</p>
        </div>
        <button v-if="!authStore.isAdmin" class="overview-greeting__cta" @click="router.push('/create-ticket')">
          <Plus :size="16" /> New Ticket
        </button>
      </div>

      <!-- Stat cards -->
      <div class="overview-stats">
        <template v-if="isLoading">
          <SkeletonLoader v-for="i in 4" :key="i" variant="stat" />
        </template>
        <template v-else>
          <div
            v-for="card in STAT_CARDS"
            :key="card.label"
            :class="['stat-card', `stat-card--${card.color}`]"
          >
            <div class="stat-card__icon">
              <component :is="card.icon" :size="22" />
            </div>
            <div class="stat-card__body">
              <span class="stat-card__value">{{ card.value }}</span>
              <span class="stat-card__label">{{ card.label }}</span>
            </div>
          </div>
        </template>
      </div>

      <div class="overview-grid">

        <!-- Category bar chart -->
        <div class="overview-card">
          <h3 class="overview-card__title">Tickets by Category</h3>
          <div class="cat-chart">
            <div v-for="cat in byCategory" :key="cat.label" class="cat-chart__row">
              <span class="cat-chart__label">{{ cat.label }}</span>
              <div class="cat-chart__track">
                <div
                  class="cat-chart__bar"
                  :style="{ width: (cat.count / maxCatCount * 100) + '%' }"
                ></div>
              </div>
              <span class="cat-chart__count">{{ cat.count }}</span>
            </div>
          </div>
        </div>

        <!-- Recent tickets -->
        <div class="overview-card">
          <div class="overview-card__header">
            <h3 class="overview-card__title">Recent Tickets</h3>
            <button class="overview-card__link" @click="goToTickets">
              View all <ArrowRight :size="13" />
            </button>
          </div>

          <div v-if="isLoading" class="recent-list">
            <SkeletonLoader v-for="i in 3" :key="i" variant="row" />
          </div>
          <div v-else-if="recent.length === 0" class="overview-empty">No tickets yet.</div>
          <div v-else class="recent-list">
            <div v-for="t in recent" :key="t.id" class="recent-item">
              <div class="recent-item__info">
                <span class="recent-item__title">{{ t.title }}</span>
                <span class="recent-item__meta">{{ t.category }} · {{ t.date }}</span>
              </div>
              <span :class="['recent-item__badge', `recent-item__badge--${statusVariant(t.status)}`]">
                {{ t.status }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
