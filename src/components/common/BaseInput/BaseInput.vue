<script setup>
import './BaseInput.scss'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },

  label: {
    type: String,
    default: '',
  },

  type: {
    type: String,
    default: 'text',
  },

  placeholder: {
    type: String,
    default: '',
  },

  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="base-input">

    <label
      v-if="label"
      class="base-input__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="base-input__required"
      >*</span>
    </label>

    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      class="base-input__field"
      @input="handleInput"
    />

  </div>
</template>
