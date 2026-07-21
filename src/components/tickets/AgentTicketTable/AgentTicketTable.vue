<script setup>
// The agent dashboard's ticket table — header, loading skeleton, rows, and
// empty state all lived directly in AgentDashboardPage.vue before; this is
// just that block extracted so the page only needs to pass it the (already
// filtered) ticket list.

//TICKETS -Admin part
import './AgentTicketTable.scss'
import { CircleUserRound, TicketX } from 'lucide-vue-next'
import SkeletonLoader from '../../common/SkeletonLoader/SkeletonLoader.vue'
import BaseIconButton from '../../common/BaseIconButton/BaseIconButton.vue'

defineProps({
  tickets: {
    type: Array,
    required: true,
  },

  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-ticket'])
</script>

<template>
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
        </tr>
      </thead>
      <tbody>
        <!-- Skeleton rows while loading -->
        <template v-if="isLoading">
          <tr v-for="i in 6" :key="'sk-' + i" class="agent-table__row agent-table__row--skeleton">
            <td colspan="7">
              <SkeletonLoader variant="row" />
            </td>
          </tr>
        </template>

        <!-- Real rows -->
        <tr
          v-else-if="tickets.length > 0"
          v-for="ticket in tickets"
          :key="ticket.id"
          class="agent-table__row"
          @click="emit('select-ticket', ticket.id)"
        >
          <td>
            <span class="agent-table__ticket-id">#TK-{{ ticket.id }}</span>
          </td>
          <td>
            <div class="agent-table__employee">
              <CircleUserRound :size="28" class="agent-table__avatar" />
              <div>
                <div class="agent-table__name">{{ ticket.createdBy }}</div>
                <div class="agent-table__email">support@integrachip.com</div>
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
          <td>
            <div class="agent-table__assigned">
              <CircleUserRound :size="20" class="agent-table__avatar agent-table__avatar--sm" />
              Support Team
            </div>
          </td>
          <td class="agent-table__date">{{ ticket.date }}</td>
        </tr>

        <!-- Empty state row -->
        <tr v-else>
          <td colspan="7">
            <div class="agent-table__empty">
              <TicketX :size="40" />
              <p>No tickets found. Adjust your filters or wait for new submissions.</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Not wired to anything in the original page either — a visual-only stub. -->
  <div class="agent-pagination">
    <BaseIconButton variant="outline" class="agent-pagination__btn">&lt;</BaseIconButton>
    <BaseIconButton variant="solid" class="agent-pagination__btn">1</BaseIconButton>
    <BaseIconButton variant="outline" class="agent-pagination__btn">2</BaseIconButton>
    <BaseIconButton variant="outline" class="agent-pagination__btn">3</BaseIconButton>
    <BaseIconButton variant="outline" class="agent-pagination__btn">&gt;</BaseIconButton>
  </div>
</template>
