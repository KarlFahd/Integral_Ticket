<script setup>
import './ClientDashboardPage.scss'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebar } from '../../composables/useSidebar.js'
import { Ticket, Timer, RefreshCw, CheckCircle, TicketX } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import TicketStatCard from '../../components/tickets/TicketStatCard/TicketStatCard.vue'
import TicketFilters from '../../components/tickets/TicketFilters/TicketFilters.vue'
import TicketCard from '../../components/tickets/TicketCard/TicketCard.vue'
import SkeletonLoader from '../../components/common/SkeletonLoader/SkeletonLoader.vue'
import { useTicketStore } from '../../stores/ticketStore.js'
import { useAuthStore } from '../../stores/authStore.js'

const router = useRouter()
const store = useTicketStore()
const authStore = useAuthStore()
const { tickets, isLoading } = storeToRefs(store)

onMounted(() => store.fetchTickets())

const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()

const searchText = ref('')
const selectedStatus = ref('All')
const selectedPriority = ref('All')
const selectedCategory = ref('All')

const myTickets = computed(() =>
  tickets.value.filter(t => t.createdBy.toLowerCase() === authStore.username.toLowerCase())
)

const openCount       = computed(() => myTickets.value.filter(t => t.status === 'Open').length)
const pendingCount    = computed(() => myTickets.value.filter(t => t.status === 'Pending').length)
const inProgressCount = computed(() => myTickets.value.filter(t => t.status === 'In Progress').length)
const resolvedCount   = computed(() => myTickets.value.filter(t => t.status === 'Approved' || t.status === 'Resolved').length)

const filteredTickets = computed(() => {
  return myTickets.value.filter(ticket => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchText.value.toLowerCase())
    const matchesStatus =
      selectedStatus.value === 'All' || ticket.status === selectedStatus.value
    const matchesPriority =
      selectedPriority.value === 'All' || ticket.priority === selectedPriority.value
    const matchesCategory =
      selectedCategory.value === 'All' || ticket.category === selectedCategory.value
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })
})

const handleSearch = (value) => {
  searchText.value = value
}

const handleStatusChange = (status) => {
  selectedStatus.value = status
}

const handlePriorityChange = (priority) => {
  selectedPriority.value = priority
}

const handleCategoryChange = (category) => {
  selectedCategory.value = category
}

const handleClearFilters = () => {
  searchText.value     = ''
  selectedStatus.value   = 'All'
  selectedPriority.value = 'All'
  selectedCategory.value = 'All'
}

const goToCreateTicket = () => {
  router.push('/create-ticket')
}

const goToTicket = (id) => {
  router.push('/ticket/' + id)
}
</script>

<template>
  <div class="client-dashboard-page">
    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" @toggle="toggleSidebar" />

    <main class="client-dashboard-page__content">
      <AppHeader title="My Tickets" subtitle="Track and manage your support requests" @toggle-sidebar="toggleSidebar" />

      <!-- Stat Cards: skeleton while loading, real cards when ready -->
      <div class="stats-row">
        <template v-if="isLoading">
          <SkeletonLoader v-for="i in 4" :key="i" variant="stat" />
        </template>
        <template v-else>
          <TicketStatCard
            title="Open Ticket"
            :count="String(openCount).padStart(2, '0')"
            variant="primary"
            :icon="Ticket"
          />
          <TicketStatCard
            title="Pending"
            :count="String(pendingCount).padStart(2, '0')"
            variant="warning"
            :icon="Timer"
          />
          <TicketStatCard
            title="In Progress"
            :count="String(inProgressCount).padStart(2, '0')"
            variant="info"
            :icon="RefreshCw"
          />
          <TicketStatCard
            title="Resolved"
            :count="String(resolvedCount).padStart(2, '0')"
            variant="success"
            :icon="CheckCircle"
          />
        </template>
      </div>

      <TicketFilters
        @search="handleSearch"
        @status-change="handleStatusChange"
        @priority-change="handlePriorityChange"
        @category-change="handleCategoryChange"
        @clear-filters="handleClearFilters"
        @create-ticket="goToCreateTicket"
      />

      <!-- Ticket List: skeleton rows while loading -->
      <div class="tickets-list">

        <template v-if="isLoading">
          <SkeletonLoader v-for="i in 5" :key="i" variant="row" />
        </template>

        <template v-else-if="filteredTickets.length === 0">
          <div class="tickets-empty">
            <TicketX :size="48" class="tickets-empty__icon" />
            <h3 class="tickets-empty__title">No tickets found</h3>
            <p class="tickets-empty__subtitle">
              {{ myTickets.length === 0
                ? 'You have no tickets yet. Create one to get started.'
                : 'No tickets match your current filters.' }}
            </p>
            <button v-if="myTickets.length === 0" class="tickets-empty__cta" @click="goToCreateTicket">
              Create your first ticket
            </button>
          </div>
        </template>

        <template v-else>
          <TicketCard
            v-for="ticket in filteredTickets"
            :key="ticket.id"
            :id="ticket.id"
            :title="ticket.title"
            :description="ticket.description"
            :date="ticket.date"
            :status="ticket.status"
            :status-variant="ticket.statusVariant"
            :priority="ticket.priority"
            :priority-variant="ticket.priorityVariant"
            :category="ticket.category"
            @select="goToTicket"
          />
        </template>

      </div>

    </main>

  </div>
</template>
