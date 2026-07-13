<script setup>
import './TicketFilters.scss'
import { ref, computed } from 'vue'
import { Search, X } from 'lucide-vue-next'

const emit = defineEmits(['search', 'status-change', 'priority-change', 'category-change', 'create-ticket', 'clear-filters'])

const searchText     = ref('')
const selectedStatus   = ref('All')
const selectedPriority = ref('All')
const selectedCategory = ref('All')

const hasActiveFilters = computed(() =>
  searchText.value !== '' ||
  selectedStatus.value !== 'All' ||
  selectedPriority.value !== 'All' ||
  selectedCategory.value !== 'All'
)

const onSearch = (e) => {
  searchText.value = e.target.value
  emit('search', searchText.value)
}

const onStatusChange = (e) => {
  selectedStatus.value = e.target.value
  emit('status-change', e.target.value)
}

const onPriorityChange = (e) => {
  selectedPriority.value = e.target.value
  emit('priority-change', e.target.value)
}

const onCategoryChange = (e) => {
  selectedCategory.value = e.target.value
  emit('category-change', e.target.value)
}

const clearFilters = () => {
  searchText.value     = ''
  selectedStatus.value   = 'All'
  selectedPriority.value = 'All'
  selectedCategory.value = 'All'
  emit('clear-filters')
}
</script>

<template>
  <div class="ticket-filters">

    <div class="ticket-filters__search">
      <Search :size="18" />
      <input
        :value="searchText"
        type="text"
        placeholder="Search ticket..."
        @input="onSearch"
      />
    </div>

    <select class="ticket-filters__select" :value="selectedStatus" @change="onStatusChange">
      <option value="All">All Status</option>
      <option value="Open">Open</option>
      <option value="Pending">Pending</option>
      <option value="In Progress">In Progress</option>
      <option value="Approved">Approved</option>
      <option value="Rejected">Rejected</option>
    </select>

    <select class="ticket-filters__select" :value="selectedPriority" @change="onPriorityChange">
      <option value="All">All Priority</option>
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select>

    <select class="ticket-filters__select" :value="selectedCategory" @change="onCategoryChange">
      <option value="All">All Category</option>
      <option value="Hardware">Hardware</option>
      <option value="Software">Software</option>
      <option value="Network">Network</option>
      <option value="Account">Account</option>
    </select>

    <button
      v-if="hasActiveFilters"
      class="ticket-filters__clear"
      @click="clearFilters"
    >
      <X :size="14" />
      Clear
    </button>

    <button
      class="ticket-filters__create"
      @click="emit('create-ticket')"
    >
      + Add Ticket
    </button>

  </div>
</template>
