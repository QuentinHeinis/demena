import type { CalendarEvent } from '~/types'
import { parseCalendarDate } from '~/utils/format'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function fold(line: string): string[] {
  const chunks: string[] = []
  let current = ''
  for (const char of line) {
    if (current.length >= 72) {
      chunks.push(current)
      current = ' '
    }
    current += char
  }
  chunks.push(current)
  return chunks
}

function stamp(date: Date, allDay: boolean): string {
  if (allDay) return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
}

function triggerValue(minutes: number): string {
  if (minutes === 0) return 'PT0M'
  if (minutes === 1440) return '-P1D'
  if (minutes === 2880) return '-P2D'
  return `-PT${minutes}M`
}

function eventLines(event: CalendarEvent, reminder: number | null, now: Date): string[] {
  const start = parseCalendarDate(event.date)
  if (!start) return []

  const end = new Date(start)
  if (event.allDay) end.setDate(start.getDate() + 1)
  else end.setHours(start.getHours() + 1)

  const description = [event.subtitle, event.done ? 'Terminée' : ''].filter(Boolean).join(' — ')
  const override = event.reminderMinutes
  const effective = override === undefined || override === -1 ? reminder : override === -2 ? null : override

  return [
    'BEGIN:VEVENT',
    `UID:${event.id}@demena.app`,
    `DTSTAMP:${stamp(now, false)}`,
    event.allDay ? `DTSTART;VALUE=DATE:${stamp(start, true)}` : `DTSTART:${stamp(start, false)}`,
    event.allDay ? `DTEND;VALUE=DATE:${stamp(end, true)}` : `DTEND:${stamp(end, false)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    'STATUS:CONFIRMED',
    ...(effective === null ? [] : [
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(event.title)}`,
      `TRIGGER:${triggerValue(effective)}`,
      'END:VALARM'
    ]),
    'END:VEVENT'
  ]
}

export function buildIcs(events: CalendarEvent[], calendarName: string, reminder: number | null): string {
  const now = new Date()
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Demena//Calendrier//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendarName)}`
  ]

  for (const event of events) lines.push(...eventLines(event, reminder, now))
  lines.push('END:VCALENDAR')

  return `${lines.flatMap(fold).join('\r\n')}\r\n`
}

export function downloadIcs(filename: string, content: string): void {
  if (!import.meta.client) return
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
