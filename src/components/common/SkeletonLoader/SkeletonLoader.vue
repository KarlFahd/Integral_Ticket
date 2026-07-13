<script setup>
defineProps({
  variant: { type: String, default: 'card' },
  rows:    { type: Number, default: 3 },
})
</script>

<template>
  <!-- Stat card skeleton -->
  <div v-if="variant === 'stat'" class="sk-stat">
    <div class="sk-circle"></div>
    <div class="sk-lines">
      <div class="sk-line sk-line--lg"></div>
      <div class="sk-line sk-line--sm"></div>
    </div>
  </div>

  <!-- Table row skeleton -->
  <div v-else-if="variant === 'row'" class="sk-row">
    <div class="sk-circle sk-circle--sm"></div>
    <div class="sk-lines">
      <div class="sk-line sk-line--full"></div>
      <div class="sk-line sk-line--half"></div>
    </div>
    <div class="sk-line sk-line--pill"></div>
  </div>

  <!-- Generic card skeleton (default) -->
  <div v-else class="sk-card">
    <div v-for="i in rows" :key="i" class="sk-line" :class="`sk-line--w${(i % 3) + 1}`"></div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.sk-base {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 800px 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 6px;
}

.sk-line, .sk-circle, .sk-lines {
  @extend .sk-base;
}

/* Stat card */
.sk-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.sk-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 800px 100%;
  animation: shimmer 1.4s ease infinite;
}
.sk-circle--sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
.sk-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: none !important;
  animation: none !important;
}
.sk-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 800px 100%;
  animation: shimmer 1.4s ease infinite;
  &--lg   { height: 18px; width: 60%; }
  &--sm   { height: 10px; width: 40%; }
  &--full { width: 100%; }
  &--half { width: 55%; height: 10px; }
  &--pill { width: 60px; height: 22px; border-radius: 20px; flex-shrink: 0; }
  &--w1   { width: 90%; }
  &--w2   { width: 70%; }
  &--w3   { width: 80%; }
}

/* Table row */
.sk-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
}

/* Generic card */
.sk-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
</style>
