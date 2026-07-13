import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
})

const STATUS_VARIANTS = {
  'Open':        'primary',
  'Pending':     'warning',
  'In Progress': 'info',
  'Approved':    'success',
  'Resolved':    'success',
  'Rejected':    'danger',
}

const PRIORITY_VARIANTS = {
  Low:    'success',
  Medium: 'warning',
  High:   'danger',
}

function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const day   = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year  = d.getFullYear()
  return `${day}-${month}-${year}`
}

function formatDateTime(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return (
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  )
}

export function normalizeMessage(raw) {
  return {
    id:      raw.id,
    sender:  raw.sender,
    isAgent: raw.is_agent,
    role:    raw.is_agent ? 'Agent' : 'Employee',
    time:    formatDateTime(raw.created_at),
    text:    raw.message,
  }
}

export function normalizeTicket(raw) {
  return {
    id:             raw.id,
    title:          raw.title,
    description:    raw.description,
    date:           formatDate(raw.created_at),
    status:         raw.status,
    statusVariant:  STATUS_VARIANTS[raw.status] ?? 'primary',
    priority:       raw.priority,
    priorityVariant: PRIORITY_VARIANTS[raw.priority] ?? 'warning',
    category:       raw.category,
    createdBy:      raw.created_by,
    ticketId:       String(raw.id),
    attachment:     raw.attachment ?? null,
    statusHistory:  raw.status_history ?? [],
  }
}

export const ticketApi = {
  async getAll() {
    const { data } = await http.get('/tickets')
    return data.data.map(normalizeTicket)
  },

  async getById(id) {
    const { data } = await http.get(`/tickets/${id}`)
    return normalizeTicket(data.data)
  },

  async create(payload) {
    const { data } = await http.post('/tickets', payload)
    return normalizeTicket(data.data)
  },

  async updateStatus(id, status) {
    const { data } = await http.patch(`/tickets/${id}/status`, { status })
    return normalizeTicket(data.data)
  },

  async updatePriority(id, priority) {
    const { data } = await http.patch(`/tickets/${id}/priority`, { priority })
    return normalizeTicket(data.data)
  },

  async getMessages(ticketId) {
    const { data } = await http.get(`/tickets/${ticketId}/messages`)
    return data.data.map(normalizeMessage)
  },

  async sendMessage(ticketId, { sender, isAgent, message }, socketId = null) {
    const headers = socketId ? { 'X-Socket-ID': socketId } : {}
    const { data } = await http.post(
      `/tickets/${ticketId}/messages`,
      { sender, is_agent: isAgent, message },
      { headers }
    )
    return normalizeMessage(data.data)
  },
}
