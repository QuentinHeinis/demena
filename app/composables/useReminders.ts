import { REMINDER_OPTIONS } from '~/utils/constants'

const STORAGE_KEY = 'demena-reminder-minutes'
const PUSH_STORAGE_KEY = 'demena-push-reminder-minutes'

export function useReminders() {
  const minutes = useState<number | null>('reminder-minutes', () => 1440)
  const pushMinutes = useState<number>('push-reminder-minutes', () => 1440)

  function init() {
    if (!import.meta.client) return

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      if (saved === 'none') {
        minutes.value = null
      } else {
        const parsed = Number(saved)
        if (REMINDER_OPTIONS.some((option) => option.value !== 'none' && Number(option.value) === parsed)) {
          minutes.value = parsed
        }
      }
    }

    const savedPush = localStorage.getItem(PUSH_STORAGE_KEY)
    if (savedPush !== null) {
      const parsed = Number(savedPush)
      if (REMINDER_OPTIONS.some((option) => option.value !== 'none' && Number(option.value) === parsed)) {
        pushMinutes.value = parsed
      }
    }
  }

  function set(value: number | null) {
    minutes.value = value
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, value === null ? 'none' : String(value))
    }
  }

  function setPush(value: number) {
    pushMinutes.value = value
    if (import.meta.client) localStorage.setItem(PUSH_STORAGE_KEY, String(value))
  }

  return { minutes, pushMinutes, init, set, setPush }
}
