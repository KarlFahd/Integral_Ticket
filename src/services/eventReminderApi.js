import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
})

function formatRelativeTime(isoString) {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function normalizeEventReminder(raw) {
  return {
    id:         raw.id,
    eventId:    raw.event_id,
    eventTitle: raw.event_title,
    preview:    raw.preview,
    time:       formatRelativeTime(raw.created_at),
  }
}

export const eventReminderApi = {
  async getAll(username) {
    const { data } = await http.get('/event-reminders', { params: { username } })
    return data.data.map(normalizeEventReminder)
  },

  async clear(id) {
    await http.delete(`/event-reminders/${id}`)
  },
}
