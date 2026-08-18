<script setup>
import './BaseWheelSelect.scss'
import { ref, computed, watch, nextTick } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { useFloatingPanel } from '../../../composables/useFloatingPanel.js'

// A single-column version of BaseTimePicker's wheel — same visual language
// (highlight bar, fade mask, scroll-snap), used wherever a plain native
// <select> should instead feel like the rest of the picker family.
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, required: true }, // [{ value, label }]
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Select…' },
})

const emit = defineEmits(['update:modelValue'])

const ITEM_HEIGHT = 36

const { triggerRef, panelRef, isOpen, isPositioned, style, toggle } = useFloatingPanel()
const wheelRef = ref(null)

const selectedIndex = computed(() => {
  const i = props.options.findIndex(o => o.value === props.modelValue)
  return i === -1 ? 0 : i
})

const selectedLabel = computed(() => props.options[selectedIndex.value]?.label ?? '')

function scrollToIndex(index, smooth = false) {
  const el = wheelRef.value
  if (!el) return
  const top = index * ITEM_HEIGHT
  if (smooth) el.scrollTo({ top, behavior: 'smooth' })
  else el.scrollTop = top
}

function scrollToSelected() {
  scrollToIndex(selectedIndex.value)
}

function toggleOpen() {
  toggle(scrollToSelected)
}

watch(() => props.modelValue, () => {
  if (isOpen.value) nextTick(scrollToSelected)
})

function selectItem(index) {
  scrollToIndex(index, true)
  emit('update:modelValue', props.options[index].value)
}

let settleTimer = null
function onScroll() {
  clearTimeout(settleTimer)
  settleTimer = setTimeout(() => {
    const el = wheelRef.value
    const index = Math.max(0, Math.min(props.options.length - 1, Math.round(el.scrollTop / ITEM_HEIGHT)))
    scrollToIndex(index, true)
    emit('update:modelValue', props.options[index].value)
  }, 120)
}
</script>

<template>
  <div class="wheel-select" ref="triggerRef">
    <label v-if="label" class="wheel-select__label">
      {{ label }} <span v-if="required" class="wheel-select__required">*</span>
    </label>

    <button
      type="button"
      class="wheel-select__field"
      :class="{ 'wheel-select__field--error': error, 'wheel-select__field--open': isOpen }"
      @click="toggleOpen"
    >
      <span :class="{ 'wheel-select__placeholder': !modelValue }">{{ selectedLabel || placeholder }}</span>
      <ChevronDown :size="14" />
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="wheel-select__panel"
        :class="{ 'wheel-select__panel--ready': isPositioned }"
        :style="style"
        ref="panelRef"
      >
        <div class="wheel-select__highlight"></div>
        <div class="wheel-select__wheel" ref="wheelRef" @scroll="onScroll">
          <div class="wheel-select__pad"></div>
          <button
            v-for="(opt, i) in options" :key="opt.value" type="button"
            class="wheel-select__item"
            :class="{ 'wheel-select__item--active': i === selectedIndex }"
            @click="selectItem(i)"
          >{{ opt.label }}</button>
          <div class="wheel-select__pad"></div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
