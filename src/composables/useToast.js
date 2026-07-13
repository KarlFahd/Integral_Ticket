import { ref } from 'vue'

// Module-level singleton — one toast list shared across the entire app
const toasts = ref([])
let _nextId = 0

export function useToast() {
  const add = (message, type = 'info', duration = 4000) => {
    const id = ++_nextId
    toasts.value.push({ id, message, type, duration, createdAt: Date.now() })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  const remove = (id) => {
    const i = toasts.value.findIndex(t => t.id === id)
    if (i !== -1) toasts.value.splice(i, 1)
  }

  return {
    toasts,
    remove,
    success: (msg, dur)  => add(msg, 'success', dur),
    error:   (msg, dur)  => add(msg, 'error', dur ?? 6000),
    info:    (msg, dur)  => add(msg, 'info', dur),
    warning: (msg, dur)  => add(msg, 'warning', dur),
  }
}
