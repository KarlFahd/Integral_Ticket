import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
})

function normalizeUser(raw) {
  return {
    id:       raw.id,
    name:     raw.name,
    username: raw.username,
    color:    raw.calendar_color,
  }
}

export function normalizeEvent(raw) {
  return {
    id:               raw.id,
    title:            raw.title,
    description:      raw.description,
    type:             raw.type,
    date:             raw.event_date,
    startTime:        raw.start_time,
    endTime:          raw.end_time,
    creator:          normalizeUser(raw.creator),
    participants:     (raw.participants ?? []).map(normalizeUser),
    googleSyncStatus: raw.google_sync_status,
  }
}

export const eventsApi = {
  async getAll() {
    const { data } = await http.get('/events')
    return data.data.map(normalizeEvent)
  },

  async create(payload) {
    const { data } = await http.post('/events', payload)
    return normalizeEvent(data.data)
  },

  async update(id, payload) {
    const { data } = await http.patch(`/events/${id}`, payload)
    return normalizeEvent(data.data)
  },

  async delete(id) {
    await http.delete(`/events/${id}`)
  },
}
