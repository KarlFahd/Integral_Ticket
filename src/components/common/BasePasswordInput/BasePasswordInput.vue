<script setup>
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

import './BasePasswordInput.scss'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },

  label: {
    type: String,
    default: '',
  },

  placeholder: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="base-password-input">
    <label
      v-if="label"
      class="base-password-input__label"
    >
      {{ label }}
    </label>

    <div class="base-password-input__wrapper">
      <input
        :value="modelValue"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        class="base-password-input__field"
        @input="handleInput"
      />

      <button
        type="button"
        class="base-password-input__toggle"
        @click="showPassword = !showPassword"
      >
        <Eye
          v-if="!showPassword"
          :size="18"
        />

        <EyeOff
          v-else
          :size="18"
        />
      </button>
    </div>
  </div>
</template>