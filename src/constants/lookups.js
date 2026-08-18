// Mirrors the backend's categories/priorities/statuses/event_types lookup
// tables (ticket-backend/database/migrations/2026_08_17_1000{0,1,2,3}_...).
// Small, fixed, rarely-changing reference data — not fetched from the API,
// so picking a value never needs a network round trip. If these ever need
// to be admin-editable, this is the file to replace with a real fetch.
//
// ids must match the backend's seeded insert order exactly.

export const CATEGORIES = [
  { id: 1, name: 'Hardware' },
  { id: 2, name: 'Software' },
  { id: 3, name: 'Network' },
  { id: 4, name: 'Account' },
]

export const PRIORITIES = [
  { id: 1, name: 'Low' },
  { id: 2, name: 'Medium' },
  { id: 3, name: 'High' },
]

export const STATUSES = [
  { id: 1, name: 'Open' },
  { id: 2, name: 'Pending' },
  { id: 3, name: 'In Progress' },
  { id: 4, name: 'Rejected' },
  { id: 5, name: 'Resolved' },
]

export const EVENT_TYPES = [
  { id: 1, name: 'meeting' },
  { id: 2, name: 'deadline' },
  { id: 3, name: 'reminder' },
  { id: 4, name: 'other' },
]
