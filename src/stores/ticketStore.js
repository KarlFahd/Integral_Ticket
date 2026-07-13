import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ticketApi } from '../services/ticketApi.js'
import { useToast }   from '../composables/useToast.js'

export const useTicketStore = defineStore('tickets', () => {
  const toast = useToast()

  const tickets    = ref([])
  const isLoading  = ref(false)
  const error      = ref(null)

  const openCount       = computed(() => tickets.value.filter(t => t.status === 'Open').length)
  const pendingCount    = computed(() => tickets.value.filter(t => t.status === 'Pending').length)
  const inProgressCount = computed(() => tickets.value.filter(t => t.status === 'In Progress').length)
  const resolvedCount   = computed(() => tickets.value.filter(t => t.status === 'Approved' || t.status === 'Resolved').length)

  // ─── Actions ─────────────────────────────────────────────────────────────────

  async function fetchTickets() {
    isLoading.value = true
    error.value = null
    try {
      tickets.value = await ticketApi.getAll()
    } catch (e) {
      error.value = 'Failed to load tickets.'
      toast.error('Could not load tickets. Please refresh.')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTicket(id) {
    try {
      return await ticketApi.getById(id)
    } catch {
      toast.error('Could not load ticket details.')
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
        category:    category || 'Software',
        priority,
        created_by:  createdBy || 'current_user',
        attachment:  attachment || null,
      })
      tickets.value.unshift(ticket)
      toast.success('Ticket created successfully.')
      return ticket
    } catch (e) {
      error.value = 'Failed to create ticket.'
      toast.error('Could not create ticket. Please try again.')
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
      toast.success(`Status updated to "${newStatus}".`)
      return updated
    } catch (e) {
      error.value = 'Failed to update status.'
      toast.error('Could not update status.')
      throw e
    }
  }

  async function updateTicketPriority(id, newPriority) {
    try {
      const updated = await ticketApi.updatePriority(id, newPriority)
      const index = tickets.value.findIndex(t => t.id === id)
      if (index !== -1) tickets.value[index] = updated
      toast.success(`Priority updated to "${newPriority}".`)
      return updated
    } catch (e) {
      error.value = 'Failed to update priority.'
      toast.error('Could not update priority.')
      throw e
    }
  }

  // Patch a ticket in local state from a WebSocket event
  function patchTicket(rawTicket) {
    const index = tickets.value.findIndex(t => t.id === rawTicket.id)
    if (index !== -1) tickets.value[index] = rawTicket
  }

  return {
    tickets,
    isLoading,
    error,
    openCount,
    pendingCount,
    inProgressCount,
    resolvedCount,
    fetchTickets,
    fetchTicket,
    addTicket,
    updateTicketStatus,
    updateTicketPriority,
    patchTicket,
  }
})
