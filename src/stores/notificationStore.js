import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationApi, normalizeNotification } from '../services/notificationApi.js'
import { eventReminderApi, normalizeEventReminder } from '../services/eventReminderApi.js'
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
      const [tickets, reminders] = await Promise.all([
        notificationApi.getAll(username),
        eventReminderApi.getAll(username),
      ])
      notifications.value = [
        ...tickets.map(n => ({ ...n, kind: 'ticket' })),
        ...reminders.map(r => ({ ...r, kind: 'event-reminder' })),
      ].sort((a, b) => b.id - a.id)
    } finally {
      isLoading.value = false
    }
  }

  function init(username) {
    if (!username || currentUsername === username) return
    currentUsername = username

    fetchNotifications(username)

    const channel = echo.channel('notifications.' + username)

    channel.listen('.notification.created', (data) => {
      const notification = normalizeNotification(data.notification)

      // Already looking at this ticket's conversation — no need to alert, just clear it.
      if (notification.ticketId === activeTicketId.value) {
        notificationApi.clear(notification.id)
        return
      }

      notifications.value.unshift({ ...notification, kind: 'ticket' })
    })

    channel.listen('.event-reminder.created', (data) => {
      const reminder = normalizeEventReminder(data.reminder)
      notifications.value.unshift({ ...reminder, kind: 'event-reminder' })
    })
  }

  async function clear(notification) {
    const id = typeof notification === 'object' ? notification.id : notification
    const kind = typeof notification === 'object' ? notification.kind : 'ticket'

    notifications.value = notifications.value.filter(n => n.id !== id || n.kind !== kind)

    if (kind === 'event-reminder') {
      await eventReminderApi.clear(id)
    } else {
      await notificationApi.clear(id)
    }
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
