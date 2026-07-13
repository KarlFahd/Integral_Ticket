import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationApi, normalizeNotification } from '../services/notificationApi.js'
import { echo } from '../echo.js'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const isLoading = ref(false)
  const activeTicketId = ref(null)
  let currentUsername = null

  const unreadCount = computed(() => notifications.value.length)

  async function fetchNotifications(username) {
    isLoading.value = true
    try {
      notifications.value = await notificationApi.getAll(username)
    } finally {
      isLoading.value = false
    }
  }

  function init(username) {
    if (!username || currentUsername === username) return
    currentUsername = username

    fetchNotifications(username)

    echo.channel('notifications.' + username)
      .listen('.notification.created', (data) => {
        const notification = normalizeNotification(data.notification)

        // Already looking at this ticket's conversation — no need to alert, just clear it.
        if (notification.ticketId === activeTicketId.value) {
          notificationApi.clear(notification.id)
          return
        }

        notifications.value.unshift(notification)
      })
  }

  async function clear(id) {
    notifications.value = notifications.value.filter(n => n.id !== id)
    await notificationApi.clear(id)
  }

  // Call when the user opens a ticket's conversation — drops any pending
  // notification for that ticket and suppresses new ones while they're on it.
  function setActiveTicket(ticketId) {
    activeTicketId.value = ticketId
    const hadPending = notifications.value.some(n => n.ticketId === ticketId)
    notifications.value = notifications.value.filter(n => n.ticketId !== ticketId)
    if (hadPending && currentUsername) {
      notificationApi.clearForTicket(ticketId, currentUsername)
    }
  }

  function clearActiveTicket() {
    activeTicketId.value = null
  }

  function reset() {
    if (currentUsername) {
      echo.leave('notifications.' + currentUsername)
    }
    currentUsername = null
    activeTicketId.value = null
    notifications.value = []
  }

  return {
    notifications,
    isLoading,
    unreadCount,
    init,
    fetchNotifications,
    clear,
    setActiveTicket,
    clearActiveTicket,
    reset,
  }
})
