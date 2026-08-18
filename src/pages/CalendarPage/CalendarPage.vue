<script setup>
import './CalendarPage.scss'
import { ref, computed, watch, onMounted } from 'vue'
import { useEventsStore } from '../../stores/eventsStore.js'
import { useUserStore } from '../../stores/userStore.js'
import { useAuthStore } from '../../stores/authStore.js'
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock, CalendarDays, Users } from 'lucide-vue-next'
import AppLayout from '../../components/layout/AppLayout/AppLayout.vue'
import BaseButton from '../../components/common/BaseButton/BaseButton.vue'
import BaseIconButton from '../../components/common/BaseIconButton/BaseIconButton.vue'
import BaseInput from '../../components/common/BaseInput/BaseInput.vue'
import BaseTimePicker from '../../components/common/BaseTimePicker/BaseTimePicker.vue'
import BaseWheelSelect from '../../components/common/BaseWheelSelect/BaseWheelSelect.vue'
import { EVENT_TYPES as EVENT_TYPE_LOOKUPS } from '../../constants/lookups.js'

const eventsStore = useEventsStore()
const userStore = useUserStore()
const authStore = useAuthStore()

onMounted(() => {
  eventsStore.initRealtime()
  eventsStore.fetchEvents()
  userStore.fetchUsers()
})

const EVENT_TYPES = EVENT_TYPE_LOOKUPS.map(t => ({
  value: t.id,
  label: t.name.charAt(0).toUpperCase() + t.name.slice(1),
}))

const eventTypeIdFor = (name) => EVENT_TYPE_LOOKUPS.find(t => t.name === name)?.id ?? EVENT_TYPE_LOOKUPS[0].id

const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const now    = new Date()
const cursor = ref(new Date(now.getFullYear(), now.getMonth(), 1))

// ── Selected day ─────────────────────────────────────────────────────────────
const selected = ref({ day: now.getDate(), month: now.getMonth(), year: now.getFullYear() })

const selectDay = (cell) => {
  if (!cell.day) return
  selected.value = { day: cell.day, month: cell.month, year: cell.year }
}

const selectedLabel = computed(() =>
  `${selected.value.day} ${SHORT_MONTHS[selected.value.month]} ${selected.value.year}`
)

const goToToday = () => {
  cursor.value  = new Date(now.getFullYear(), now.getMonth(), 1)
  selected.value = { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() }
}

// ── Calendar grid ─────────────────────────────────────────────────────────────
const monthLabel = computed(() => `${MONTHS[cursor.value.getMonth()]} ${cursor.value.getFullYear()}`)

const prevMonth = () => cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() - 1, 1)
const nextMonth = () => cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 1)

const cells = computed(() => {
  const year  = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const total = new Date(year, month + 1, 0).getDate()
  let startDow = new Date(year, month, 1).getDay()
  startDow = startDow === 0 ? 6 : startDow - 1

  const result = []
  for (let i = 0; i < startDow; i++) result.push({ day: null })
  for (let d = 1; d <= total; d++)   result.push({ day: d, year, month })
  return result
})

const isToday = (cell) =>
  cell.day === now.getDate() && cell.month === now.getMonth() && cell.year === now.getFullYear()

const isSelected = (cell) =>
  cell.day === selected.value.day &&
  cell.month === selected.value.month &&
  cell.year  === selected.value.year

const isWeekend = (index) => { const c = index % 7; return c === 5 || c === 6 }

const dayKey = (d) => `${d.year}-${String(d.month + 1).padStart(2,'0')}-${String(d.day).padStart(2,'0')}`
const selectedKey = computed(() => dayKey(selected.value))

// Distinct creator colors for a day's dots (readability — see legend below)
const dotColorsFor = (cell) => {
  if (!cell.day) return []
  const dayEvents = eventsStore.eventsByDate[dayKey(cell)] ?? []
  return [...new Set(dayEvents.map(e => e.creator.color))].slice(0, 4)
}

// ── Events ────────────────────────────────────────────────────────────────────
const selectedEvents = computed(() =>
  (eventsStore.eventsByDate[selectedKey.value] ?? [])
    .slice()
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
)

// Every user who has at least one event — the "this color = this person" legend.
const legendUsers = computed(() => {
  const usedColors = new Set(eventsStore.events.map(e => e.creator.color))
  return userStore.users.filter(u => usedColors.has(u.calendar_color))
})

const myColor = computed(() =>
  userStore.users.find(u => u.username === authStore.username)?.calendar_color
    ?? authStore.user?.calendar_color
)

// ── Add / edit event form ────────────────────────────────────────────────────
// null = creating a new event; a numeric id = editing that existing one.
const editingEventId = ref(null)

const showForm     = ref(false)
const newTitle      = ref('')
const newDescription = ref('')
const newType        = ref(eventTypeIdFor('meeting'))
const newStartTime   = ref('09:00')
const newEndTime     = ref('')
const newParticipants = ref([])

const resetFields = () => {
  newTitle.value = ''
  newDescription.value = ''
  newType.value = eventTypeIdFor('meeting')
  newStartTime.value = '09:00'
  newEndTime.value = ''
  newParticipants.value = []
  validationErrors.value = {}
}

const openCreateForm = () => {
  resetFields()
  editingEventId.value = null
  showForm.value = true
}

const openEditForm = (ev) => {
  newTitle.value = ev.title
  newDescription.value = ev.description
  newType.value = eventTypeIdFor(ev.type)
  newStartTime.value = ev.startTime
  newEndTime.value = ev.endTime || ''
  newParticipants.value = ev.participants.map(p => p.username)
  validationErrors.value = {}
  editingEventId.value = ev.id
  showForm.value = true
}

const closeForm = () => {
  resetFields()
  editingEventId.value = null
  showForm.value = false
}

const toggleParticipant = (username) => {
  const i = newParticipants.value.indexOf(username)
  if (i === -1) newParticipants.value.push(username)
  else newParticipants.value.splice(i, 1)
}

// ── Validation — same pattern as CreateTicketPage.vue: errors only appear
// after Save is clicked, and clear per-field as soon as the user retypes.
const validationErrors = ref({})

const validate = () => {
  const errors = {}
  if (!newTitle.value.trim())
    errors.title = 'Title is required.'
  else if (newTitle.value.trim().length < 3)
    errors.title = 'Title must be at least 3 characters.'

  if (!newDescription.value.trim())
    errors.description = 'Description is required.'
  else if (newDescription.value.trim().length < 3)
    errors.description = 'Description must be at least 3 characters.'

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

watch(newTitle, () => { validationErrors.value.title = '' })
watch(newDescription, () => { validationErrors.value.description = '' })

const saveEvent = async () => {
  if (!validate()) return

  const payload = {
    title: newTitle.value.trim(),
    description: newDescription.value.trim(),
    type_id: newType.value,
    // The event stays on whichever day is currently selected — safe because
    // an event can only be opened for editing from that same day's list.
    event_date: selectedKey.value,
    start_time: newStartTime.value,
    end_time: newEndTime.value || null,
    participant_usernames: newParticipants.value,
  }

  try {
    if (editingEventId.value) {
      await eventsStore.updateEvent(editingEventId.value, payload)
    } else {
      await eventsStore.addEvent({ ...payload, username: authStore.username })
    }
    closeForm()
  } catch {
    // eventsStore already surfaced a toast — form stays open so the user can retry.
  }
}

const removeEvent = (id) => {
  eventsStore.deleteEvent(id)
}

const monthEventCount = computed(() => {
  const prefix = `${cursor.value.getFullYear()}-${String(cursor.value.getMonth() + 1).padStart(2, '0')}`
  return eventsStore.events.filter(e => e.date.startsWith(prefix)).length
})
</script>

<template>
  <AppLayout
    class="calendar-page"
    content-class="calendar-page__content"
    title="Calendar"
    subtitle="Your schedule and events"
  >
      <div class="cal-layout">

        <!-- ── LEFT: Calendar grid ─────────────────────────────────────────── -->
        <div class="cal-card">

          <div class="cal-card__nav">
            <BaseIconButton variant="outline" class="cal-nav-btn" @click="prevMonth"><ChevronLeft :size="18" /></BaseIconButton>
            <h2 class="cal-card__month">{{ monthLabel }}</h2>
            <BaseIconButton variant="outline" class="cal-nav-btn" @click="nextMonth"><ChevronRight :size="18" /></BaseIconButton>
          </div>

          <div class="cal-grid cal-grid--header">
            <div v-for="d in DAYS" :key="d" class="cal-cell cal-cell--header">{{ d }}</div>
          </div>

          <div class="cal-grid">
            <div
              v-for="(cell, i) in cells"
              :key="i"
              :class="[
                'cal-cell',
                { 'cal-cell--empty':    !cell.day },
                { 'cal-cell--today':    isToday(cell) },
                { 'cal-cell--selected': !isToday(cell) && isSelected(cell) },
                { 'cal-cell--weekend':  cell.day && isWeekend(i) && !isToday(cell) && !isSelected(cell) },
                { 'cal-cell--clickable': cell.day },
              ]"
              @click="selectDay(cell)"
            >
              <span v-if="cell.day" class="cal-cell__number">{{ cell.day }}</span>
              <span v-if="dotColorsFor(cell).length" class="cal-cell__dots">
                <span
                  v-for="c in dotColorsFor(cell)"
                  :key="c"
                  class="cal-cell__dot"
                  :style="{ background: isToday(cell) ? undefined : c }"
                ></span>
              </span>
            </div>
          </div>

          <!-- Color legend — "this color = this person" -->
          <div v-if="legendUsers.length" class="cal-legend">
            <span v-for="u in legendUsers" :key="u.id" class="cal-legend__item">
              <span class="cal-legend__dot" :style="{ background: u.calendar_color }"></span>
              {{ u.name }}
            </span>
          </div>

        </div>

        <!-- ── RIGHT: Events panel ─────────────────────────────────────────── -->
        <div class="events-panel">

          <!-- Panel header -->
          <div class="events-panel__header">
            <div class="events-panel__date-block">
              <CalendarDays :size="16" class="events-panel__date-icon" />
              <span class="events-panel__date-label">{{ selectedLabel }}</span>
            </div>
            <BaseButton variant="secondary" size="sm" class="events-panel__today-btn" @click="goToToday">Today</BaseButton>
          </div>

          <!-- Add event button / form -->
          <div class="events-panel__add-wrap">
            <BaseButton v-if="!showForm" variant="secondary" size="sm" full-width class="events-panel__add-btn" @click="openCreateForm">
              <Plus :size="14" /> Add Event
            </BaseButton>

            <div v-else class="event-form">
              <div v-if="editingEventId" class="event-form__editing-badge">Editing event</div>

              <div class="event-form__group">
                <BaseInput
                  v-model="newTitle"
                  label="Title"
                  required
                  :error="!!validationErrors.title"
                  placeholder="Event title…"
                  @keydown.enter="saveEvent"
                />
                <p v-if="validationErrors.title" class="event-form__error">{{ validationErrors.title }}</p>
              </div>

              <div class="event-form__group">
                <label class="event-form__label">Description <span class="event-form__required">*</span></label>
                <textarea
                  v-model="newDescription"
                  class="event-form__textarea"
                  :class="{ 'event-form__textarea--error': validationErrors.description }"
                  placeholder="What's this about? (visible to everyone on the shared calendar)"
                  rows="2"
                ></textarea>
                <p v-if="validationErrors.description" class="event-form__error">{{ validationErrors.description }}</p>
              </div>

              <div class="event-form__group">
                <BaseWheelSelect v-model="newType" label="Type" :options="EVENT_TYPES" />
              </div>

              <div class="event-form__schedule">
                <div class="event-form__field">
                  <label class="event-form__field-label">Start</label>
                  <BaseTimePicker v-model="newStartTime" class="event-form__time" />
                </div>
                <div class="event-form__field">
                  <label class="event-form__field-label">End <span class="event-form__optional">(optional)</span></label>
                  <BaseTimePicker v-model="newEndTime" class="event-form__time" />
                </div>
              </div>

              <div v-if="userStore.users.length" class="event-form__participants">
                <span class="event-form__participants-label"><Users :size="12" /> Invite</span>
                <label
                  v-for="u in userStore.users.filter(u => u.username !== authStore.username)"
                  :key="u.id"
                  class="event-form__participant"
                >
                  <input
                    type="checkbox"
                    :checked="newParticipants.includes(u.username)"
                    @change="toggleParticipant(u.username)"
                  />
                  <span class="event-form__participant-dot" :style="{ background: u.calendar_color }"></span>
                  {{ u.name }}
                </label>
              </div>

              <div class="event-form__you" v-if="myColor">
                <span class="event-form__you-dot" :style="{ background: myColor }"></span>
                This event will show as your color
              </div>

              <div class="event-form__actions">
                <BaseButton variant="secondary" size="sm" class="event-form__cancel" @click="closeForm">Cancel</BaseButton>
                <BaseButton variant="primary" size="sm" :disabled="eventsStore.isLoading" class="event-form__save" @click="saveEvent">
                  {{ editingEventId ? 'Update' : 'Save' }}
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Events list -->
          <div class="events-panel__list">

            <div v-if="selectedEvents.length === 0" class="events-panel__empty">
              <span>No events for this day.</span>
              <span class="events-panel__empty-hint">Click "Add Event" to create one.</span>
            </div>

            <div
              v-for="ev in selectedEvents"
              :key="ev.id"
              class="event-item"
              :class="{ 'event-item--editing': editingEventId === ev.id }"
              :style="{ '--ev-color': ev.creator.color }"
              @click="openEditForm(ev)"
            >
              <div class="event-item__stripe"></div>
              <div class="event-item__body">
                <span class="event-item__title">{{ ev.title }}</span>
                <span class="event-item__meta">
                  <Clock :size="11" /> {{ ev.startTime }}<span v-if="ev.endTime"> – {{ ev.endTime }}</span>
                  <span class="event-item__type">{{ ev.type }}</span>
                </span>
                <span class="event-item__by">by {{ ev.creator.name }}<span v-if="ev.participants.length"> · with {{ ev.participants.map(p => p.name).join(', ') }}</span></span>
                <span v-if="ev.googleSyncStatus === 'failed'" class="event-item__sync-pending">Google sync pending</span>
              </div>
              <BaseIconButton variant="ghost-danger" class="event-item__delete" @click.stop="removeEvent(ev.id)">
                <Trash2 :size="13" />
              </BaseIconButton>
            </div>

          </div>

          <!-- Mini month summary -->
          <div class="events-panel__summary">
            <span class="events-panel__summary-label">{{ monthLabel }}</span>
            <span class="events-panel__summary-count">{{ monthEventCount }} event(s)</span>
          </div>

        </div>

      </div>
  </AppLayout>
</template>
