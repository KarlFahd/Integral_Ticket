<script setup>
// The agent dashboard's "Top Category" side panel — a conic-gradient pie
// built from ticket counts per category, plus its legend. The gradient
// math and color palette moved in here from AgentDashboardPage.vue too,
// not just the markup, since nothing else needs them.


import { computed } from 'vue'
import './CategoryPieChart.scss'
import AgentPanel from '../AgentPanel/AgentPanel.vue'

const props = defineProps({
  // Array of { name, count, percent }
  stats: {
    type: Array,
    required: true,
  },
})

const PIE_COLORS = ['#7C3AED', '#3B82F6', '#F59E0B', '#10B981', '#EF4444']

const pieBackground = computed(() => {
  const stops = props.stats.map((s, i) => {
    const start = props.stats.slice(0, i).reduce((a, b) => a + b.percent, 0)
    const end = props.stats.slice(0, i + 1).reduce((a, b) => a + b.percent, 0)
    return `${PIE_COLORS[i % PIE_COLORS.length]} ${start}% ${end}%`
  })
  return `conic-gradient(${stops.join(', ')})`
})

const legendColor = (index) => PIE_COLORS[index % PIE_COLORS.length]
</script>

<template>
  <AgentPanel title="Top Category">
    <div class="category-chart">
      <div class="category-chart__pie" :style="{ background: pieBackground }"></div>

      <div class="category-chart__legend">
        <div
          v-for="(cat, i) in stats"
          :key="cat.name"
          class="category-chart__legend-item"
        >
          <span class="category-chart__legend-dot" :style="{ background: legendColor(i) }"></span>
          <span class="category-chart__legend-label">{{ cat.name }} {{ cat.percent }}%</span>
        </div>
      </div>
    </div>
  </AgentPanel>
</template>
