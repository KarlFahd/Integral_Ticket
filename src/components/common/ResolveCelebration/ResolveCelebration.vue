<script setup>
import './ResolveCelebration.scss'
import { ref } from 'vue'

const PARTICLE_COLORS = ['#7b2ff7', '#28c76f', '#f2994a', '#4f6cff', '#eb5757', '#ffd166']
const PARTICLE_COUNT = 28

const particles = ref([])
const visible = ref(false)
let hideTimer = null

function fire() {
  particles.value = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.3
    const distance = 120 + Math.random() * 160
    return {
      id: i,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotate: Math.random() * 720 - 360,
      delay: Math.random() * 0.15,
      size: 6 + Math.random() * 6,
    }
  })

  visible.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { visible.value = false }, 1800)
}

defineExpose({ fire })
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="resolve-celebration">
      <span
        v-for="p in particles"
        :key="p.id"
        class="resolve-celebration__particle"
        :style="{
          '--x': p.x + 'px',
          '--y': p.y + 'px',
          '--rotate': p.rotate + 'deg',
          '--delay': p.delay + 's',
          '--size': p.size + 'px',
          background: p.color,
        }"
      ></span>
      <div class="resolve-celebration__badge">
        <span>🎉 Ticket Resolved!</span>
      </div>
    </div>
  </Teleport>
</template>
