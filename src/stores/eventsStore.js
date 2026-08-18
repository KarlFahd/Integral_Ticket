import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { eventsApi, normalizeEvent } from '../services/eventsApi.js'
import { useToast }   from '../composables/useToast.js'
import { echo }       from '../echo.js'

let realtimeInitialized = false

export const useEventsStore = defineStore('events', () => {
  const toast = useToast()

  const events    = ref([])
  const isLoading = ref(false)
  const error     = ref(null)

  // Keyed by "YYYY-MM-DD" so the month grid can look up a day's events in O(1).
  const eventsByDate = computed(() => {
    const map = {}
    for (const ev of events.value) {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    }
    return map
  })

  function warnIfGoogleSyncFailed(event) {
    if (event.googleSyncStatus === 'failed') {
      toast.warning('Saved locally — Google Calendar sync failed, will show as pending.')
    }
  }

  // Events can be created with no browser involved at all — the bot creates
  // them server-side via the create_event MCP tool — so the Calendar page
  // needs to hear about changes over the websocket, not just on page load.
  // Module-level guard (not a ref) because this only needs to run once per
  // browser tab, ever, regardless of how many times the Calendar page mounts.
  function initRealtime() {
    if (realtimeInitialized) return
    realtimeInitialized = true

    echo.channel('calendar-events')
      .listen('.event.created', (data) => {
        const event = normalizeEvent(data.event)
        // Guards against double-adding when THIS tab is the one that just
        // created the event — addEvent() below already pushed it locally.
        if (!events.value.some(e => e.id === event.id)) {
          events.value.push(event)
        }
      })
      .listen('.event.updated', (data) => {
        const event = normalizeEvent(data.event)
        const index = events.value.findIndex(e => e.id === event.id)
        if (index !== -1) events.value[index] = event
      })
      .listen('.event.deleted', (data) => {
        events.value = events.value.filter(e => e.id !== data.event_id)
      })
  }

  async function fetchEvents() {
    isLoading.value = true
    error.value = null
    try {
      events.value = await eventsApi.getAll()
    } catch (e) {
      error.value = 'Failed to load events.'
      toast.error('Could not load calendar events. Please refresh.')
    } finally {
      isLoading.value = false
    }
  }

  async function addEvent(payload) {
    isLoading.value = true
    error.value = null
    try {
      const event = await eventsApi.create(payload)
      events.value.push(event)
      toast.success('Event saved.')
      warnIfGoogleSyncFailed(event)
      return event
    } catch (e) {
      error.value = 'Failed to create event.'
      toast.error('Could not create event. Please try again.')
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateEvent(id, payload) {
    try {
      const updated = await eventsApi.update(id, payload)
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) events.value[index] = updated
      toast.success('Event updated.')
      warnIfGoogleSyncFailed(updated)
      return updated
    } catch (e) {
      toast.error('Could not update event.')
      throw e
    }
  }

  async function deleteEvent(id) {
    try {
      await eventsApi.delete(id)
      events.value = events.value.filter(e => e.id !== id)
      toast.success('Event deleted.')
    } catch (e) {
      toast.error('Could not delete event. Please try again.')
      throw e
    }
  }

  return {
    events,
    isLoading,
    error,
    eventsByDate,
    initRealtime,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
  }
})
