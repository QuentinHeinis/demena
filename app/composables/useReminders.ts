import { REMINDER_OPTIONS } from '~/utils/constants'

const STORAGE_KEY = 'demena-reminder-minutes'

export function useReminders() {
  const minutes = useState<number | null>('reminder-minutes', () => 1440)

  function init() {
    if (!import.meta.client) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === null) return
    if (saved === 'none') {
      minutes.value = null
      return
    }
    const parsed = Number(saved)
    if (REMINDER_OPTIONS.some((option) => option.value !== 'none' && Number(option.value) === parsed)) {
      minutes.value = parsed
    }
  }

  function set(value: number | null) {
    minutes.value = value
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, value === null ? 'none' : String(value))
    }
  }

  return { minutes, init, set }
}
