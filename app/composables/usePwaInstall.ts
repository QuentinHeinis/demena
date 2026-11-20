import type { BeforeInstallPromptEvent } from '~/types'

const DISMISS_KEY = 'demena-pwa-install-dismissed'
const DISMISS_DELAY = 7 * 24 * 60 * 60 * 1000

interface NavigatorStandalone extends Navigator {
  standalone?: boolean
}

export function usePwaInstall() {
  const prompt = useState<BeforeInstallPromptEvent | null>('pwa-install-prompt', () => null)
  const installed = useState<boolean>('pwa-installed', () => false)

  const isStandalone = ref(false)
  const isMobile = ref(false)
  const isIos = ref(false)
  const dismissedAt = ref<number | null>(null)

  onMounted(() => {
    const nav = window.navigator as NavigatorStandalone
    const ua = nav.userAgent
    const iosDevice = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && nav.maxTouchPoints > 1)

    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
    isIos.value = iosDevice
    isMobile.value = iosDevice || /android|mobile|tablet/i.test(ua)

    const stored = window.localStorage.getItem(DISMISS_KEY)
    dismissedAt.value = stored ? Number(stored) : null
  })

  const shouldShow = computed(() => {
    if (!import.meta.client) return false
    if (installed.value || isStandalone.value || !isMobile.value) return false
    if (!isIos.value && !prompt.value) return false
    if (dismissedAt.value && Date.now() - dismissedAt.value < DISMISS_DELAY) return false
    return true
  })

  function dismiss() {
    const now = Date.now()
    dismissedAt.value = now
    if (import.meta.client) window.localStorage.setItem(DISMISS_KEY, String(now))
  }

  async function install(): Promise<boolean> {
    const event = prompt.value
    if (!event) return false

    try {
      await event.prompt()
      const choice = await event.userChoice
      if (choice.outcome === 'accepted') installed.value = true
      else dismiss()
      return choice.outcome === 'accepted'
    } catch {
      return false
    } finally {
      prompt.value = null
    }
  }

  return {
    prompt,
    installed,
    isIos,
    isStandalone,
    isMobile,
    shouldShow,
    install,
    dismiss
  }
}
