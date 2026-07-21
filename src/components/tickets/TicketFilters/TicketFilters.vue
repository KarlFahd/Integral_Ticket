<script setup>
import './TicketFilters.scss'
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'

import BaseButton from '../../common/BaseButton/BaseButton.vue'
import BaseSearchInput from '../../common/BaseSearchInput/BaseSearchInput.vue'
import BaseSelect from '../../common/BaseSelect/BaseSelect.vue'

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

const onSearch = (value) => {
  searchText.value = value
  emit('search', value)
}

const onStatusChange = (value) => {
  selectedStatus.value = value
  emit('status-change', value)
}

const onPriorityChange = (value) => {
  selectedPriority.value = value
  emit('priority-change', value)
}

const onCategoryChange = (value) => {
  selectedCategory.value = value
  emit('category-change', value)
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

    <BaseSearchInput
      :model-value="searchText"
      placeholder="Search ticket..."
      class="ticket-filters__search"
      @update:model-value="onSearch"
    />

    <BaseSelect :model-value="selectedStatus" class="ticket-filters__select" @update:model-value="onStatusChange">
      <option value="All">All Status</option>
      <option value="Open">Open</option>
      <option value="Pending">Pending</option>
      <option value="In Progress">In Progress</option>
      <option value="Resolved">Resolved</option>
      <option value="Rejected">Rejected</option>
    </BaseSelect>

    <BaseSelect :model-value="selectedPriority" class="ticket-filters__select" @update:model-value="onPriorityChange">
      <option value="All">All Priority</option>
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </BaseSelect>

    <BaseSelect :model-value="selectedCategory" class="ticket-filters__select" @update:model-value="onCategoryChange">
      <option value="All">All Category</option>
      <option value="Hardware">Hardware</option>
      <option value="Software">Software</option>
      <option value="Network">Network</option>
      <option value="Account">Account</option>
    </BaseSelect>

    <BaseButton
      v-if="hasActiveFilters"
      variant="outline-danger"
      size="lg"
      :full-width="false"
      class="ticket-filters__clear"
      @click="clearFilters"
    >
      <X :size="14" />
      Clear
    </BaseButton>

    <BaseButton
      variant="primary"
      size="lg"
      :full-width="false"
      class="ticket-filters__create"
      @click="emit('create-ticket')"
    >
      + Add Ticket
    </BaseButton>

  </div>
</template>
