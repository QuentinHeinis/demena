import type { Apartment, CalendarEvent, Task } from '~/types'
import { CALENDAR_KINDS, type CalendarEventKind } from '~/utils/constants'
import { localDateKey, parseCalendarDate } from '~/utils/format'
import { buildIcs, downloadIcs } from '~/utils/ics'

interface CalendarDay {
  key: string
  date: Date
  inMonth: boolean
  isToday: boolean
}

export function useCalendar() {
  const workspace = useWorkspace()
  const reminders = useReminders()
  const tasks = useCollection<Task>('tasks')
  const apartments = useCollection<Apartment>('apartments')
  const toast = useToast()

  const todayKey = computed(() => localDateKey(new Date()))
  const selectedKey = ref(todayKey.value)
  const cursor = ref(new Date())
  const kinds = ref<CalendarEventKind[]>(CALENDAR_KINDS.map((kind) => kind.value))
  const loading = computed(() => workspace.loading.value || tasks.loading.value || apartments.loading.value)

  const events = computed<CalendarEvent[]>(() => {
    const result: CalendarEvent[] = []
    const current = workspace.workspace.value

    if (current?.move_date) {
      result.push({
        id: `move-${current.id}`,
        kind: 'move',
        title: 'Jour J — Déménagement',
        subtitle: current.destination || current.name,
        date: current.move_date,
        dateKey: localDateKey(current.move_date),
        allDay: true,
        to: '/parametres'
      })
    }

    for (const apartment of apartments.items.value) {
      if (!apartment.visit_date) continue
      result.push({
        id: `visit-${apartment.id}`,
        kind: 'visit',
        title: `Visite — ${apartment.title}`,
        subtitle: [apartment.address, apartment.city].filter(Boolean).join(', '),
        date: apartment.visit_date,
        dateKey: localDateKey(apartment.visit_date),
        allDay: false,
        to: '/appartements'
      })
    }

    for (const task of tasks.items.value) {
      if (!task.due_date) continue
      result.push({
        id: `task-${task.id}`,
        kind: 'task',
        title: task.title,
        subtitle: task.done ? 'Terminée' : 'Échéance à respecter',
        date: task.due_date,
        dateKey: localDateKey(task.due_date),
        allDay: true,
        done: task.done,
        to: '/taches'
      })
    }

    return result.sort((a, b) => a.date.localeCompare(b.date))
  })

  const visibleEvents = computed(() => events.value.filter((event) => kinds.value.includes(event.kind)))

  const eventsByKey = computed(() => {
    const grouped = new Map<string, CalendarEvent[]>()
    for (const event of visibleEvents.value) {
      const list = grouped.get(event.dateKey) ?? []
      list.push(event)
      grouped.set(event.dateKey, list)
    }
    return grouped
  })

  const selectedEvents = computed(() => {
    return (eventsByKey.value.get(selectedKey.value) ?? [])
      .slice()
      .sort((a, b) => Number(a.allDay) - Number(b.allDay) || a.date.localeCompare(b.date))
  })

  const days = computed<CalendarDay[]>(() => {
    const first = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1)
    const offset = (first.getDay() + 6) % 7
    const start = new Date(first)
    start.setDate(first.getDate() - offset)

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return {
        key: localDateKey(date),
        date,
        inMonth: date.getMonth() === cursor.value.getMonth(),
        isToday: localDateKey(date) === todayKey.value
      }
    })
  })

  const monthLabel = computed(() => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(cursor.value))

  async function fetch() {
    await Promise.all([tasks.fetch(), apartments.fetch()])
  }

  function moveMonth(delta: number) {
    cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + delta, 1)
  }

  function goToday() {
    cursor.value = new Date()
    selectedKey.value = todayKey.value
  }

  function selectDay(key: string) {
    selectedKey.value = key
    const date = parseCalendarDate(key)
    if (date) cursor.value = new Date(date.getFullYear(), date.getMonth(), 1)
  }

  function toggleKind(kind: CalendarEventKind) {
    kinds.value = kinds.value.includes(kind)
      ? kinds.value.filter((item) => item !== kind)
      : [...kinds.value, kind]
  }

  function calendarName(): string {
    return `Déména — ${workspace.workspace.value?.name ?? 'Mon espace'}`
  }

  function exportAll() {
    downloadIcs(`demena-calendrier-${todayKey.value}.ics`, buildIcs(visibleEvents.value, calendarName(), reminders.minutes.value))
    toast.success('Calendrier exporté. Ouvrez le fichier sur votre téléphone pour l’ajouter à votre application Calendrier.')
  }

  function exportOne(event: CalendarEvent) {
    downloadIcs(`demena-${event.dateKey}-${event.kind}.ics`, buildIcs([event], calendarName(), reminders.minutes.value))
    toast.success('Événement ajouté au fichier calendrier.')
  }

  return {
    todayKey,
    selectedKey,
    cursor,
    kinds,
    loading,
    events,
    visibleEvents,
    eventsByKey,
    selectedEvents,
    days,
    monthLabel,
    reminders,
    fetch,
    moveMonth,
    goToday,
    selectDay,
    toggleKind,
    exportAll,
    exportOne
  }
}
