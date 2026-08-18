<script setup>
import './AgentDashboardPage.scss'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  TicketIcon,
  Clock,
  Loader2,
  CheckCircle2,
} from 'lucide-vue-next'

import AppLayout from '../../components/layout/AppLayout/AppLayout.vue'
import AgentStatCard from '../../components/tickets/AgentStatCard/AgentStatCard.vue'
import AgentTicketFilters from '../../components/tickets/AgentTicketFilters/AgentTicketFilters.vue'
import AgentTicketTable from '../../components/tickets/AgentTicketTable/AgentTicketTable.vue'
import QuickStatusPanel from '../../components/tickets/QuickStatusPanel/QuickStatusPanel.vue'
import CategoryPieChart from '../../components/tickets/CategoryPieChart/CategoryPieChart.vue'
import { useTicketStore } from '../../stores/ticketStore.js'

const router = useRouter()

const goToTicket = (id) => {
  router.push('/agent-ticket/' + id)
}

const goToHistory = () => router.push('/history')

const store = useTicketStore()
const { tickets, isLoading, openCount, pendingCount, inProgressCount, resolvedCount } = storeToRefs(store)

onMounted(() => store.fetchTickets())

// â”€â”€â”€ Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const searchQuery    = ref('')
const filterStatus   = ref('')
const filterPriority = ref('')
const filterCategory = ref('')

const filteredTickets = computed(() => {
  return tickets.value.filter(t => {
    if (t.status === 'Resolved') return false

    const matchSearch = !searchQuery.value ||
      t.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.createdBy.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchStatus = !filterStatus.value || t.status === filterStatus.value
    const matchPriority = !filterPriority.value || t.priority === filterPriority.value
    const matchCategory = !filterCategory.value || t.category === filterCategory.value

    return matchSearch && matchStatus && matchPriority && matchCategory
  })
})

// â”€â”€â”€ Category stats for pie chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
</script>

<template>
  <AppLayout
    class="agent-dashboard"
    content-class="agent-dashboard__content"
    title="Support Dashboard"
    subtitle="Manage and resolve support tickets"
  >
      <div class="agent-dashboard__inner">

        <div class="agent-dashboard__body">

          <!-- â”€â”€â”€ LEFT: stats + table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
          <div class="agent-dashboard__main">

            <!-- Stat Cards -->
            <div class="agent-stats">
              <AgentStatCard label="Open Ticket" :value="openCount" variant="primary" :icon="TicketIcon" />
              <AgentStatCard label="Pending" :value="pendingCount" variant="warning" :icon="Clock" />
              <AgentStatCard label="In Progress" :value="inProgressCount" variant="info" :icon="Loader2" />
              <AgentStatCard
                label="Resolved"
                :value="resolvedCount"
                variant="success"
                :icon="CheckCircle2"
                subtitle="View History"
                clickable
                @click="goToHistory"
              />
            </div>

            <AgentTicketFilters
              @search="searchQuery = $event"
              @status-change="filterStatus = $event"
              @priority-change="filterPriority = $event"
              @category-change="filterCategory = $event"
              @clear-filters="searchQuery = ''; filterStatus = ''; filterPriority = ''; filterCategory = ''"
            />

            <AgentTicketTable
              :tickets="filteredTickets"
              :is-loading="isLoading"
              @select-ticket="goToTicket"
            />

          </div>

          <!-- â”€â”€â”€ RIGHT: sidebar panels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
          <div class="agent-dashboard__aside">

            <QuickStatusPanel
              :open-count="openCount"
              :pending-count="pendingCount"
              :in-progress-count="inProgressCount"
              :resolved-count="resolvedCount"
              @view-history="goToHistory"
            />

            <CategoryPieChart :stats="categoryStats" />

          </div>

        </div>
      </div>
  </AppLayout>
</template>
