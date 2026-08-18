<script setup>
// The agent dashboard's filter bar — same idea and structure as the
// existing TicketFilters (used on ClientDashboardPage), just with the
// agent's own default filter values ('' instead of 'All') and an Export
// action instead of Add Ticket.

//TICKETS -filter-Agent part
import './AgentTicketFilters.scss'
import { ref, computed } from 'vue'
import { Download, X } from 'lucide-vue-next'

import BaseButton from '../../common/BaseButton/BaseButton.vue'
import BaseSearchInput from '../../common/BaseSearchInput/BaseSearchInput.vue'
import BaseSelect from '../../common/BaseSelect/BaseSelect.vue'

const emit = defineEmits(['search', 'status-change', 'priority-change', 'category-change', 'clear-filters'])

const searchQuery    = ref('')
const filterStatus   = ref('')
const filterPriority = ref('')
const filterCategory = ref('')

const hasActiveFilters = computed(() =>
  searchQuery.value !== '' || filterStatus.value !== '' ||
  filterPriority.value !== '' || filterCategory.value !== ''
)

const onSearch = (value) => {
  searchQuery.value = value
  emit('search', value)
}

const onStatusChange = (value) => {
  filterStatus.value = value
  emit('status-change', value)
}

const onPriorityChange = (value) => {
  filterPriority.value = value
  emit('priority-change', value)
}

const onCategoryChange = (value) => {
  filterCategory.value = value
  emit('category-change', value)
}

const clearFilters = () => {
  searchQuery.value    = ''
  filterStatus.value   = ''
  filterPriority.value = ''
  filterCategory.value = ''
  emit('clear-filters')
}
</script>

<template>
  <div class="agent-filters">

    <BaseSearchInput
      :model-value="searchQuery"
      size="md"
      placeholder="Search Ticket..."
      class="agent-filters__search"
      @update:model-value="onSearch"
    />

    <BaseSelect :model-value="filterStatus" size="md" class="agent-filters__select" @update:model-value="onStatusChange">
      <option value="">All Status</option>
      <option value="Open">Open</option>
      <option value="Pending">Pending</option>
      <option value="In Progress">In Progress</option>
      <option value="Rejected">Rejected</option>
    </BaseSelect>

    <BaseSelect :model-value="filterPriority" size="md" class="agent-filters__select" @update:model-value="onPriorityChange">
      <option value="">All Priority</option>
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </BaseSelect>

    <BaseSelect :model-value="filterCategory" size="md" class="agent-filters__select" @update:model-value="onCategoryChange">
      <option value="">All Category</option>
      <option value="Hardware">Hardware</option>
      <option value="Software">Software</option>
      <option value="Network">Network</option>
      <option value="Account">Account</option>
    </BaseSelect>

    <BaseButton
      v-if="hasActiveFilters"
      variant="outline-danger"
      size="md"
      :full-width="false"
      class="agent-filters__clear"
      @click="clearFilters"
    >
      <X :size="14" />
      Clear
    </BaseButton>

    <!-- Not wired to anything in the original page either — a visual-only stub. -->
    <BaseButton variant="primary" size="md" :full-width="false" class="agent-filters__export">
      <Download :size="15" />
      Export
    </BaseButton>

  </div>
</template>
