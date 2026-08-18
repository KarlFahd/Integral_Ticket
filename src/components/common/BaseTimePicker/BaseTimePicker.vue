<script setup>
import './BaseTimePicker.scss'
import { ref, computed, watch, nextTick } from 'vue'
import { Clock } from 'lucide-vue-next'
import { useFloatingPanel } from '../../../composables/useFloatingPanel.js'

// modelValue is always 24-hour "HH:mm" (e.g. "14:00") — same format the
// rest of the app (eventsApi, the backend) already expects. Internally we
// track hour/minute/AM-PM separately since that's what the wheels show.
const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Select time' },
})

const emit = defineEmits(['update:modelValue'])

const ITEM_HEIGHT = 36
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)
const MERIDIEMS = ['AM', 'PM']

function parseValue(value) {
  if (!value) return { hour12: 9, minute: 0, meridiem: 'AM' }
  const [h, m] = value.split(':').map(Number)
  const meridiem = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return { hour12, minute: m, meridiem }
}

function to24Hour({ hour12, minute, meridiem }) {
  const h = meridiem === 'PM' ? (hour12 % 12) + 12 : hour12 % 12
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const selected = ref(parseValue(props.modelValue))

const displayLabel = computed(() => {
  if (!props.modelValue) return ''
  const { hour12, minute, meridiem } = selected.value
  return `${hour12}:${String(minute).padStart(2, '0')} ${meridiem}`
})

function pad2(n) { return String(n).padStart(2, '0') }

// ── Open / close / positioning ───────────────────────────────────────────────
const { triggerRef, panelRef, isOpen, isPositioned, style, toggle } = useFloatingPanel()

const hourWheelRef = ref(null)
const minuteWheelRef = ref(null)
const meridiemWheelRef = ref(null)

function scrollRefFor(which) {
  if (which === 'hour') return hourWheelRef.value
  if (which === 'minute') return minuteWheelRef.value
  return meridiemWheelRef.value
}

function valuesFor(which) {
  if (which === 'hour') return HOURS
  if (which === 'minute') return MINUTES
  return MERIDIEMS
}

function scrollToIndex(el, index, smooth = false) {
  if (!el) return
  const top = index * ITEM_HEIGHT
  if (smooth) el.scrollTo({ top, behavior: 'smooth' })
  else el.scrollTop = top
}

function currentIndex(which) {
  if (which === 'hour') return HOURS.indexOf(selected.value.hour12)
  if (which === 'minute') return selected.value.minute
  return MERIDIEMS.indexOf(selected.value.meridiem)
}

function scrollAllToSelected() {
  scrollToIndex(hourWheelRef.value, currentIndex('hour'))
  scrollToIndex(minuteWheelRef.value, currentIndex('minute'))
  scrollToIndex(meridiemWheelRef.value, currentIndex('meridiem'))
}

function toggleOpen() {
  toggle(scrollAllToSelected)
}

watch(() => props.modelValue, (value) => {
  selected.value = parseValue(value)
  if (isOpen.value) nextTick(scrollAllToSelected)
})

// ── Selecting a value ────────────────────────────────────────────────────────
function applySelection(which, value) {
  if (which === 'hour') selected.value.hour12 = value
  else if (which === 'minute') selected.value.minute = value
  else selected.value.meridiem = value
  emit('update:modelValue', to24Hour(selected.value))
}

function selectItem(which, index) {
  scrollToIndex(scrollRefFor(which), index, true)
  applySelection(which, valuesFor(which)[index])
}

// Debounced "settle" — fires ~120ms after the user stops scrolling/flicking
// a wheel, snaps it exactly onto the nearest item, and commits that value.
const settleTimers = {}
function onWheelScroll(which) {
  clearTimeout(settleTimers[which])
  settleTimers[which] = setTimeout(() => {
    const el = scrollRefFor(which)
    const values = valuesFor(which)
    const index = Math.max(0, Math.min(values.length - 1, Math.round(el.scrollTop / ITEM_HEIGHT)))
    scrollToIndex(el, index, true)
    applySelection(which, values[index])
  }, 120)
}
</script>

<template>
  <div class="time-picker" ref="triggerRef">
    <label v-if="label" class="time-picker__label">
      {{ label }} <span v-if="required" class="time-picker__required">*</span>
    </label>

    <button
      type="button"
      class="time-picker__field"
      :class="{ 'time-picker__field--error': error, 'time-picker__field--open': isOpen }"
      @click="toggleOpen"
    >
      <span :class="{ 'time-picker__placeholder': !modelValue }">{{ displayLabel || placeholder }}</span>
      <Clock :size="14" />
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="time-picker__panel"
        :class="{ 'time-picker__panel--ready': isPositioned }"
        :style="style"
        ref="panelRef"
      >
        <div class="time-picker__highlight"></div>

        <div class="time-picker__wheel" ref="hourWheelRef" @scroll="onWheelScroll('hour')">
          <div class="time-picker__pad"></div>
          <button
            v-for="h in HOURS" :key="h" type="button"
            class="time-picker__item"
            :class="{ 'time-picker__item--active': h === selected.hour12 }"
            @click="selectItem('hour', HOURS.indexOf(h))"
          >{{ h }}</button>
          <div class="time-picker__pad"></div>
        </div>

        <div class="time-picker__wheel" ref="minuteWheelRef" @scroll="onWheelScroll('minute')">
          <div class="time-picker__pad"></div>
          <button
            v-for="m in MINUTES" :key="m" type="button"
            class="time-picker__item"
            :class="{ 'time-picker__item--active': m === selected.minute }"
            @click="selectItem('minute', m)"
          >{{ pad2(m) }}</button>
          <div class="time-picker__pad"></div>
        </div>

        <div class="time-picker__wheel time-picker__wheel--meridiem" ref="meridiemWheelRef" @scroll="onWheelScroll('meridiem')">
          <div class="time-picker__pad"></div>
          <button
            v-for="(mer, i) in MERIDIEMS" :key="mer" type="button"
            class="time-picker__item"
            :class="{ 'time-picker__item--active': mer === selected.meridiem }"
            @click="selectItem('meridiem', i)"
          >{{ mer }}</button>
          <div class="time-picker__pad"></div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
