const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const numberFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

export function formatEuro(value: number | null | undefined): string {
  return euroFormatter.format(value ?? 0)
}

export function formatNumber(value: number | null | undefined): string {
  return numberFormatter.format(value ?? 0)
}

export function formatDate(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', options ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export function formatDateShort(value: string | Date | null | undefined): string {
  return formatDate(value, { day: '2-digit', month: '2-digit' })
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function daysUntil(value: string | Date | null | undefined): number | null {
  if (!value) return null
  const target = new Date(value)
  if (Number.isNaN(target.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function daysUntilLabel(value: string | Date | null | undefined): string {
  const days = daysUntil(value)
  if (days === null) return 'Date non définie'
  if (days === 0) return "C'est aujourd'hui !"
  if (days === 1) return 'Demain'
  if (days < 0) return `Il y a ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`
  return `Dans ${days} jour${days > 1 ? 's' : ''}`
}

export function isOverdue(value: string | Date | null | undefined): boolean {
  const days = daysUntil(value)
  return days !== null && days < 0
}

export function initials(name: string | null | undefined): string {
  if (!name?.trim()) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}
