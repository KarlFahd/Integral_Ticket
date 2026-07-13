<script setup>
import './CalendarPage.scss'
import { ref, computed } from 'vue'
import { useSidebar } from '../../composables/useSidebar.js'
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock, CalendarDays } from 'lucide-vue-next'
import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'

const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()

const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const now    = new Date()
const cursor = ref(new Date(now.getFullYear(), now.getMonth(), 1))

// â”€â”€ Selected day â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Calendar grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// Dots on calendar days that have events
const hasEvents = (cell) => cell.day && events.value.some(e => e.date === dayKey(cell))

// â”€â”€ Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EVENT_COLORS = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444']

const events = ref([
  { id: 1, date: dayKey({ day: now.getDate(), month: now.getMonth(), year: now.getFullYear() }), title: 'Team Stand-up', time: '09:00', color: '#7c3aed' },
  { id: 2, date: dayKey({ day: now.getDate(), month: now.getMonth(), year: now.getFullYear() }), title: 'Sprint Review', time: '14:00', color: '#0ea5e9' },
])

const selectedEvents = computed(() =>
  events.value
    .filter(e => e.date === selectedKey.value)
    .sort((a, b) => a.time.localeCompare(b.time))
)

// â”€â”€ Add event form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const showForm   = ref(false)
const newTitle   = ref('')
const newTime    = ref('09:00')
const colorIndex = ref(0)

const addEvent = () => {
  if (!newTitle.value.trim()) return
  events.value.push({
    id:    Date.now(),
    date:  selectedKey.value,
    title: newTitle.value.trim(),
    time:  newTime.value,
    color: EVENT_COLORS[colorIndex.value],
  })
  newTitle.value   = ''
  newTime.value    = '09:00'
  colorIndex.value = (colorIndex.value + 1) % EVENT_COLORS.length
  showForm.value   = false
}

const removeEvent = (id) => {
  events.value = events.value.filter(e => e.id !== id)
}

const monthEventCount = computed(() => {
  const prefix = `${cursor.value.getFullYear()}-${String(cursor.value.getMonth() + 1).padStart(2, '0')}`
  return events.value.filter(e => e.date.startsWith(prefix)).length
})
</script>

<template>
  <div class="calendar-page">
    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" @toggle="toggleSidebar" />

    <main class="calendar-page__content">
      <AppHeader title="Calendar" subtitle="Your schedule and events" @toggle-sidebar="toggleSidebar" />

      <div class="cal-layout">

        <!-- â”€â”€ LEFT: Calendar grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <div class="cal-card">

          <div class="cal-card__nav">
            <button class="cal-nav-btn" @click="prevMonth"><ChevronLeft :size="18" /></button>
            <h2 class="cal-card__month">{{ monthLabel }}</h2>
            <button class="cal-nav-btn" @click="nextMonth"><ChevronRight :size="18" /></button>
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
              <span v-if="hasEvents(cell)" class="cal-cell__dot"></span>
            </div>
          </div>

        </div>

        <!-- â”€â”€ RIGHT: Events panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <div class="events-panel">

          <!-- Panel header -->
          <div class="events-panel__header">
            <div class="events-panel__date-block">
              <CalendarDays :size="16" class="events-panel__date-icon" />
              <span class="events-panel__date-label">{{ selectedLabel }}</span>
            </div>
            <button class="events-panel__today-btn" @click="goToToday">Today</button>
          </div>

          <!-- Add event button / form -->
          <div class="events-panel__add-wrap">
            <button v-if="!showForm" class="events-panel__add-btn" @click="showForm = true">
              <Plus :size="14" /> Add Event
            </button>

            <div v-else class="event-form">
              <input
                v-model="newTitle"
                class="event-form__input"
                type="text"
                placeholder="Event title…"
                @keydown.enter="addEvent"
                autofocus
              />
              <input
                v-model="newTime"
                class="event-form__time"
                type="time"
              />
              <div class="event-form__colors">
                <button
                  v-for="(c, idx) in EVENT_COLORS"
                  :key="c"
                  class="event-form__color-dot"
                  :style="{ background: c, outline: colorIndex === idx ? `2px solid ${c}` : 'none' }"
                  @click="colorIndex = idx"
                ></button>
              </div>
              <div class="event-form__actions">
                <button class="event-form__cancel" @click="showForm = false">Cancel</button>
                <button class="event-form__save" :disabled="!newTitle.trim()" @click="addEvent">Save</button>
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
              :style="{ '--ev-color': ev.color }"
            >
              <div class="event-item__stripe"></div>
              <div class="event-item__body">
                <span class="event-item__title">{{ ev.title }}</span>
                <span class="event-item__time">
                  <Clock :size="11" /> {{ ev.time }}
                </span>
              </div>
              <button class="event-item__delete" @click="removeEvent(ev.id)">
                <Trash2 :size="13" />
              </button>
            </div>

          </div>

          <!-- Mini month summary -->
          <div class="events-panel__summary">
            <span class="events-panel__summary-label">{{ monthLabel }}</span>
            <span class="events-panel__summary-count">{{ monthEventCount }} event(s)</span>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>
