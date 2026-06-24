import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STATUS_VARIANTS = {
  'Open':        'primary',
  'Pending':     'warning',
  'In Progress': 'info',
  'Approved':    'success',
  'Resolved':    'success',
  'Rejected':    'danger',
}

const PRIORITY_VARIANTS = {
  low:    'success',
  medium: 'warning',
  high:   'danger',
}

export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref([
    {
      id: 123,
      title: 'Ticket #123 - Login Issue',
      description: 'The button is not working when we click on it',
      date: '06/15/2026',
      status: 'In Progress',
      statusVariant: 'info',
      priority: 'Medium',
      priorityVariant: 'warning',
      category: 'IT Support',
      createdBy: 'Karl Fahd',
      ticketId: '1028685',
      attachment: 'screenshot-login-error.png',
    },
    {
      id: 124,
      title: 'Ticket #124 - Password Reset',
      description: 'User cannot reset the password',
      date: '06/16/2026',
      status: 'Rejected',
      statusVariant: 'danger',
      priority: 'High',
      priorityVariant: 'danger',
      category: 'Account',
      createdBy: 'Karl Fahd',
      ticketId: '1028686',
      attachment: null,
    },
    {
      id: 125,
      title: 'Ticket #125 - Account Access',
      description: 'User cannot access the dashboard',
      date: '06/17/2026',
      status: 'Pending',
      statusVariant: 'warning',
      priority: 'Low',
      priorityVariant: 'success',
      category: 'Software',
      createdBy: 'Karl Fahd',
      ticketId: '1028687',
      attachment: null,
    },
  ])

  const nextId = ref(126)

  const openCount = computed(
    () => tickets.value.filter(t => t.status === 'Open').length
  )
  const pendingCount = computed(
    () => tickets.value.filter(t => t.status === 'Pending').length
  )
  const inProgressCount = computed(
    () => tickets.value.filter(t => t.status === 'In Progress').length
  )
  const resolvedCount = computed(
    () => tickets.value.filter(t => t.status === 'Approved' || t.status === 'Resolved').length
  )

  // ─── Conversations (keyed by ticket id) ──────────────────────────────────────

  const conversations = ref({
    123: [
      { id: 1, isAgent: false, role: 'Employee', time: '11 Jun 2026, 10:30AM', text: 'The button is not working when we click on it' },
      { id: 2, isAgent: true,  role: 'Agent',    time: '11 Jun 2026, 10:35AM', text: 'We are looking into this issue and will get back to you shortly.' },
      { id: 3, isAgent: false, role: 'Employee', time: '11 Jun 2026, 10:40AM', text: 'The button is still not working, please help.' },
      { id: 4, isAgent: true,  role: 'Agent',    time: '11 Jun 2026, 10:45AM', text: 'We have escalated this to the engineering team.' },
    ],
  })

  // ─── Cross-tab sync via BroadcastChannel ─────────────────────────────────────

  const syncChannel = new BroadcastChannel('integra-ticket-store')
  let isSyncing = false

  syncChannel.onmessage = (event) => {
    isSyncing = true
    tickets.value = event.data.tickets
    conversations.value = event.data.conversations
    nextId.value = event.data.nextId
    isSyncing = false
  }

  function broadcastState() {
    if (isSyncing) return
    syncChannel.postMessage(
      JSON.parse(JSON.stringify({
        tickets: tickets.value,
        conversations: conversations.value,
        nextId: nextId.value,
      }))
    )
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────

  function addTicket({ subject, description, category, priority, attachment }) {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day   = String(now.getDate()).padStart(2, '0')
    const year  = now.getFullYear()

    tickets.value.push({
      id: nextId.value,
      title: `Ticket #${nextId.value} - ${subject}`,
      description,
      date: `${month}/${day}/${year}`,
      status: 'Pending',
      statusVariant: 'warning',
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      priorityVariant: PRIORITY_VARIANTS[priority] ?? 'warning',
      category: category || 'General',
      createdBy: 'Karl Fahd',
      ticketId: String(1028685 + (nextId.value - 123)),
      attachment: attachment || null,
    })

    nextId.value++
    broadcastState()
  }

  function updateTicketStatus(id, newStatus) {
    const ticket = tickets.value.find(t => t.id === id)
    if (!ticket) return
    ticket.status = newStatus
    ticket.statusVariant = STATUS_VARIANTS[newStatus] ?? 'primary'
    broadcastState()
  }

  function sendMessage(ticketId, { isAgent, text }) {
    if (!conversations.value[ticketId]) {
      conversations.value[ticketId] = []
    }
    const msgs = conversations.value[ticketId]
    const nextMsgId = msgs.length > 0 ? Math.max(...msgs.map(m => m.id)) + 1 : 1
    const now  = new Date()
    const time =
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    msgs.push({ id: nextMsgId, isAgent, role: isAgent ? 'Agent' : 'Employee', time, text })
    broadcastState()
  }

  return {
    tickets,
    openCount,
    pendingCount,
    inProgressCount,
    resolvedCount,
    conversations,
    addTicket,
    updateTicketStatus,
    sendMessage,
  }
})
