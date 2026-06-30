<script setup>
import './TicketFilters.scss'

import { Search } from 'lucide-vue-next'

const emit = defineEmits(['search', 'status-change', 'priority-change', 'category-change', 'create-ticket'])

const handleSearch = (event) => {
  emit('search', event.target.value)
}

const handleStatusChange = (event) => {
  emit('status-change', event.target.value)
}

const handlePriorityChange = (event) => {
  emit('priority-change', event.target.value)
}

const handleCategoryChange = (event) => {
  emit('category-change', event.target.value)
}
</script>

<template>
  <div class="ticket-filters">

    <div class="ticket-filters__search">

      <Search :size="18" />

      <input
        type="text"
        placeholder="Search Ticket..."
        @input="handleSearch"
      />

    </div>

    <select class="ticket-filters__select" @change="handleStatusChange">
      <option value="All">All Status</option>
      <option value="Open">Open</option>
      <option value="Pending">Pending</option>
      <option value="In Progress">In Progress</option>
      <option value="Approved">Approved</option>
      <option value="Rejected">Rejected</option>
    </select>

    <select class="ticket-filters__select" @change="handlePriorityChange">
      <option value="All">All Priority</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>

    <select class="ticket-filters__select" @change="handleCategoryChange">
      <option value="All">All Category</option>
      <option value="hardware">Hardware</option>
      <option value="software">Software</option>
      <option value="network">Network</option>
      <option value="account">Account</option>
    </select>

    <button
      class="ticket-filters__create"
      @click="emit('create-ticket')"
    >
      + Create Ticket
    </button>

  </div>
</template>
