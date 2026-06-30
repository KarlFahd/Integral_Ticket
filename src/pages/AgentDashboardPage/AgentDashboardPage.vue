<script setup>
import './AgentDashboardPage.scss'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSidebar } from '../../composables/useSidebar.js'
import {
  TicketIcon,
  Clock,
  Loader2,
  CheckCircle2,
  Search,
  Download,
  MoreVertical,
  CircleUserRound,
} from 'lucide-vue-next'

import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import { useTicketStore } from '../../stores/ticketStore.js'

const router = useRouter()
const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()

const goToTicket = (id) => {
  router.push('/agent-ticket/' + id)
}

const store = useTicketStore()
const { tickets, openCount, pendingCount, inProgressCount, resolvedCount } = storeToRefs(store)

onMounted(() => store.fetchTickets())

// ─── Filters ──────────────────────────────────────────────────────────────────

const searchQuery = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const filterCategory = ref('')

const filteredTickets = computed(() => {
  return tickets.value.filter(t => {
    const matchSearch = !searchQuery.value ||
      t.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.createdBy.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchStatus = !filterStatus.value || t.status === filterStatus.value
    const matchPriority = !filterPriority.value || t.priority.toLowerCase() === filterPriority.value
    const matchCategory = !filterCategory.value || t.category === filterCategory.value

    return matchSearch && matchStatus && matchPriority && matchCategory
  })
})

// ─── Category stats for pie chart ─────────────────────────────────────────────

const categoryStats = computed(() => {
  const counts = {}
  tickets.value.forEach(t => {
    counts[t.category] = (counts[t.category] || 0) + 1
  })
  const total = tickets.value.length || 1
  return Object.entries(counts).map(([name, count]) => ({
    name,
    count,
    percent: Math.round((count / total) * 100),
  }))
})

const PIE_COLORS = ['#7C3AED', '#3B82F6', '#F59E0B', '#10B981', '#EF4444']
</script>

<template>
  <div class="agent-dashboard">

    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" />

    <main class="agent-dashboard__content">

      <AppHeader title="Support Dashboard" subtitle="Manage and resolve support ticket" @toggle-sidebar="toggleSidebar" />

      <div class="agent-dashboard__inner">

        <div class="agent-dashboard__body">

          <!-- ─── LEFT: stats + table ──────────────────────────────────── -->
          <div class="agent-dashboard__main">

            <!-- Stat Cards -->
            <div class="agent-stats">

              <div class="stat-card">
                <div class="stat-card__icon stat-card__icon--primary">
                  <TicketIcon :size="22" />
                </div>
                <div class="stat-card__info">
                  <span class="stat-card__label">Open Ticket</span>
                  <span class="stat-card__value stat-card__value--primary">{{ openCount }}</span>
                  <span class="stat-card__sub">Need Your Attention</span>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-card__icon stat-card__icon--warning">
                  <Clock :size="22" />
                </div>
                <div class="stat-card__info">
                  <span class="stat-card__label">Pending</span>
                  <span class="stat-card__value stat-card__value--warning">{{ pendingCount }}</span>
                  <span class="stat-card__sub">Need Your Attention</span>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-card__icon stat-card__icon--info">
                  <Loader2 :size="22" />
                </div>
                <div class="stat-card__info">
                  <span class="stat-card__label">In Progress</span>
                  <span class="stat-card__value stat-card__value--info">{{ inProgressCount }}</span>
                  <span class="stat-card__sub">Need Your Attention</span>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-card__icon stat-card__icon--success">
                  <CheckCircle2 :size="22" />
                </div>
                <div class="stat-card__info">
                  <span class="stat-card__label">Resolved</span>
                  <span class="stat-card__value stat-card__value--success">{{ resolvedCount }}</span>
                  <span class="stat-card__sub">Need Your Attention</span>
                </div>
              </div>

            </div>

            <!-- Filters -->
            <div class="agent-filters">

              <div class="agent-filters__search">
                <Search :size="16" class="agent-filters__search-icon" />
                <input
                  v-model="searchQuery"
                  class="agent-filters__search-input"
                  placeholder="Search Ticket..."
                />
              </div>

              <select v-model="filterStatus" class="agent-filters__select">
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select v-model="filterPriority" class="agent-filters__select">
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <select v-model="filterCategory" class="agent-filters__select">
                <option value="">All Category</option>
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="network">Network</option>
                <option value="account">Account</option>
              </select>

              <button class="agent-filters__export">
                <Download :size="15" />
                +Export
              </button>

            </div>

            <!-- Ticket Table -->
            <div class="agent-table-wrapper">
              <table class="agent-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Employee</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Created On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ticket in filteredTickets" :key="ticket.id" class="agent-table__row" @click="goToTicket(ticket.id)">

                    <td>
                      <span class="agent-table__ticket-id">#TK-{{ ticket.id }}</span>
                    </td>

                    <td>
                      <div class="agent-table__employee">
                        <CircleUserRound :size="28" class="agent-table__avatar" />
                        <div>
                          <div class="agent-table__name">{{ ticket.createdBy }}</div>
                          <div class="agent-table__email">karl.fahed.95@gmail.com</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span class="agent-table__category">{{ ticket.category }}</span>
                    </td>

                    <td>
                      <span :class="['agent-table__priority', `agent-table__priority--${ticket.priorityVariant}`]">
                        ● {{ ticket.priority }}
                      </span>
                    </td>

                    <td>
                      <span :class="['agent-table__status', `agent-table__status--${ticket.statusVariant}`]">
                        {{ ticket.status }}
                      </span>
                    </td>

                    <td>
                      <div class="agent-table__assigned">
                        <CircleUserRound :size="20" class="agent-table__avatar agent-table__avatar--sm" />
                        Sarah Azar
                      </div>
                    </td>

                    <td class="agent-table__date">{{ ticket.date }}</td>

                    <td>
                      <button class="agent-table__action">
                        <MoreVertical :size="16" />
                      </button>
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="agent-pagination">
              <button class="agent-pagination__btn">&lt;</button>
              <button class="agent-pagination__btn agent-pagination__btn--active">1</button>
              <button class="agent-pagination__btn">2</button>
              <button class="agent-pagination__btn">3</button>
              <button class="agent-pagination__btn">&gt;</button>
            </div>

          </div>

          <!-- ─── RIGHT: sidebar panels ────────────────────────────────── -->
          <div class="agent-dashboard__aside">

            <!-- Quick Status -->
            <div class="agent-panel">
              <h3 class="agent-panel__title">Quick Status</h3>
              <div class="agent-panel__status-list">
                <div class="quick-status-item">
                  <span class="quick-status-item__dot quick-status-item__dot--primary"></span>
                  <span class="quick-status-item__label">Open</span>
                  <span class="quick-status-item__count">{{ openCount }}</span>
                </div>
                <div class="quick-status-item">
                  <span class="quick-status-item__dot quick-status-item__dot--warning"></span>
                  <span class="quick-status-item__label">Pending</span>
                  <span class="quick-status-item__count">{{ pendingCount }}</span>
                </div>
                <div class="quick-status-item">
                  <span class="quick-status-item__dot quick-status-item__dot--info"></span>
                  <span class="quick-status-item__label">In Progress</span>
                  <span class="quick-status-item__count">{{ inProgressCount }}</span>
                </div>
                <div class="quick-status-item">
                  <span class="quick-status-item__dot quick-status-item__dot--success"></span>
                  <span class="quick-status-item__label">Resolved</span>
                  <span class="quick-status-item__count">{{ resolvedCount }}</span>
                </div>
              </div>
            </div>

            <!-- Top Category -->
            <div class="agent-panel">
              <h3 class="agent-panel__title">Top Category</h3>

              <div class="category-chart">
                <div
                  class="category-chart__pie"
                  :style="{
                    background: `conic-gradient(${categoryStats.map((s, i) => `${PIE_COLORS[i % PIE_COLORS.length]} ${categoryStats.slice(0,i).reduce((a,b)=>a+b.percent,0)}% ${categoryStats.slice(0,i+1).reduce((a,b)=>a+b.percent,0)}%`).join(', ')})`
                  }"
                ></div>

                <div class="category-chart__legend">
                  <div
                    v-for="(cat, i) in categoryStats"
                    :key="cat.name"
                    class="category-chart__legend-item"
                  >
                    <span
                      class="category-chart__legend-dot"
                      :style="{ background: PIE_COLORS[i % PIE_COLORS.length] }"
                    ></span>
                    <span class="category-chart__legend-label">{{ cat.name }} {{ cat.percent }}%</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </main>

  </div>
</template>
