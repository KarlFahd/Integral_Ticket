<script setup>
// This page reuses the agent dashboard's filter-bar and table look without
// using the AgentTicketFilters/AgentTicketTable components themselves (its
// table has different columns — no "Assigned To", "Resolved On" instead of
// "Created On" — so their exact markup doesn't fit). Pulling in their .scss
// keeps that shared look as one source of truth instead of a third copy.
import '../../components/tickets/AgentTicketFilters/AgentTicketFilters.scss'
import '../../components/tickets/AgentTicketTable/AgentTicketTable.scss'
import '../AgentDashboardPage/AgentDashboardPage.scss'
import './HistoryPage.scss'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { History as HistoryIcon, CircleUserRound, TicketX } from 'lucide-vue-next'

import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import SkeletonLoader from '../../components/common/SkeletonLoader/SkeletonLoader.vue'
import BaseSearchInput from '../../components/common/BaseSearchInput/BaseSearchInput.vue'
import { useSidebar } from '../../composables/useSidebar.js'
import { useTicketStore } from '../../stores/ticketStore.js'

const router = useRouter()
const store = useTicketStore()
const { tickets, isLoading } = storeToRefs(store)

onMounted(() => store.fetchTickets())

const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()

const searchQuery = ref('')

const resolvedTickets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return tickets.value
    .filter(t => t.status === 'Resolved')
    .filter(t => !q || t.title.toLowerCase().includes(q) || t.createdBy.toLowerCase().includes(q))
})

const goToTicket = (id) => router.push('/agent-ticket/' + id)
</script>

<template>
  <div class="agent-dashboard">
    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" @toggle="toggleSidebar" />

    <main class="agent-dashboard__content">
      <AppHeader title="Ticket History" subtitle="Resolved tickets archive" @toggle-sidebar="toggleSidebar" />

      <div class="agent-dashboard__inner">

        <div class="history-header">
          <div class="history-header__left">
            <HistoryIcon :size="20" />
            <span>{{ resolvedTickets.length }} resolved ticket{{ resolvedTickets.length !== 1 ? 's' : '' }}</span>
          </div>
        </div>

        <div class="agent-filters">
          <BaseSearchInput
            v-model="searchQuery"
            size="md"
            placeholder="Search resolved tickets..."
            class="agent-filters__search"
          />
        </div>

        <div class="agent-table-wrapper">
          <table class="agent-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Employee</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Resolved On</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="isLoading">
                <tr v-for="i in 6" :key="'sk-' + i" class="agent-table__row agent-table__row--skeleton">
                  <td colspan="6">
                    <SkeletonLoader variant="row" />
                  </td>
                </tr>
              </template>

              <tr
                v-else-if="resolvedTickets.length > 0"
                v-for="ticket in resolvedTickets"
                :key="ticket.id"
                class="agent-table__row"
                @click="goToTicket(ticket.id)"
              >
                <td>
                  <span class="agent-table__ticket-id">#TK-{{ ticket.id }}</span>
                </td>
                <td>
                  <div class="agent-table__employee">
                    <CircleUserRound :size="28" class="agent-table__avatar" />
                    <div>
                      <div class="agent-table__name">{{ ticket.createdBy }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="agent-table__category">{{ ticket.category }}</span>
                </td>
                <td>
                  <span :class="['agent-table__priority', `agent-table__priority--${ticket.priorityVariant}`]">
                    {{ ticket.priority }}
                  </span>
                </td>
                <td>
                  <span :class="['agent-table__status', `agent-table__status--${ticket.statusVariant}`]">
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="agent-table__date">{{ ticket.date }}</td>
              </tr>

              <tr v-else>
                <td colspan="6">
                  <div class="agent-table__empty">
                    <TicketX :size="40" />
                    <p>{{ searchQuery ? 'No resolved tickets match your search.' : 'No resolved tickets yet.' }}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </main>

  </div>
</template>
