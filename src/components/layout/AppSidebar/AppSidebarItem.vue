<script setup>
// One nav row in AppSidebar — extracted because the same markup (icon,
// collapse-aware label, active state, hover-out tooltip) was copy-pasted
// 8 times in AppSidebar.vue with only the icon/label/path changing.
// Styling intentionally stays in AppSidebar.scss (.app-sidebar__item) since
// it's this component's only consumer, not a general-purpose look.

defineProps({
  icon: {
    type: [Object, Function],
    required: true,
  },

  label: {
    type: String,
    required: true,
  },

  active: {
    type: Boolean,
    default: false,
  },

  collapsed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const handleClick = () => emit('click')
</script>

<template>
  <button
    :class="['app-sidebar__item', { 'app-sidebar__item--active': active }]"
    :data-tooltip="label"
    @click="handleClick"
  >
    <component :is="icon" :size="22" />
    <span v-if="!collapsed">{{ label }}</span>
  </button>
</template>
