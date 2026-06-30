import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ticketApi } from '../services/ticketApi.js'

export const useTicketStore = defineStore('tickets', () => {
  const tickets    = ref([])
  const isLoading  = ref(false)
  const error      = ref(null)

  const openCount       = computed(() => tickets.value.filter(t => t.status === 'Open').length)
  const pendingCount    = computed(() => tickets.value.filter(t => t.status === 'Pending').length)
  const inProgressCount = computed(() => tickets.value.filter(t => t.status === 'In Progress').length)
  const resolvedCount   = computed(() => tickets.value.filter(t => t.status === 'Approved' || t.status === 'Resolved').length)

  // ─── Conversations (in-memory only, keyed by ticket id) ──────────────────────

  const conversations = ref({})

  // ─── Actions ─────────────────────────────────────────────────────────────────

  async function fetchTickets() {
    isLoading.value = true
    error.value = null
    try {
      tickets.value = await ticketApi.getAll()
    } catch (e) {
      error.value = 'Failed to load tickets.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTicket(id) {
    try {
      return await ticketApi.getById(id)
    } catch {
      return null
    }
  }

  async function addTicket({ subject, description, category, priority, attachment, createdBy }) {
    isLoading.value = true
    error.value = null
    try {
      const ticket = await ticketApi.create({
        title:       subject,
        description,
        category:    category || 'software',
        priority,
        created_by:  createdBy || 'current_user',
        attachment:  attachment || null,
      })
      tickets.value.unshift(ticket)
      return ticket
    } catch (e) {
      error.value = 'Failed to create ticket.'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateTicketStatus(id, newStatus) {
    try {
      const updated = await ticketApi.updateStatus(id, newStatus)
      const index = tickets.value.findIndex(t => t.id === id)
      if (index !== -1) tickets.value[index] = updated
      return updated
    } catch (e) {
      error.value = 'Failed to update status.'
      throw e
    }
  }

  async function updateTicketPriority(id, newPriority) {
    try {
      const updated = await ticketApi.updatePriority(id, newPriority)
      const index = tickets.value.findIndex(t => t.id === id)
      if (index !== -1) tickets.value[index] = updated
      return updated
    } catch (e) {
      error.value = 'Failed to update priority.'
      throw e
    }
  }

  function sendMessage(ticketId, { isAgent, text }) {
    if (!conversations.value[ticketId]) conversations.value[ticketId] = []
    const msgs = conversations.value[ticketId]
    const nextMsgId = msgs.length > 0 ? Math.max(...msgs.map(m => m.id)) + 1 : 1
    const now  = new Date()
    const time =
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    msgs.push({ id: nextMsgId, isAgent, role: isAgent ? 'Agent' : 'Employee', time, text })
  }

  return {
    tickets,
    isLoading,
    error,
    openCount,
    pendingCount,
    inProgressCount,
    resolvedCount,
    conversations,
    fetchTickets,
    fetchTicket,
    addTicket,
    updateTicketStatus,
    updateTicketPriority,
    sendMessage,
  }
})
