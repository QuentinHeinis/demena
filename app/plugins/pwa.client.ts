import type { BeforeInstallPromptEvent } from '~/types'

export default defineNuxtPlugin(() => {
  const prompt = useState<BeforeInstallPromptEvent | null>('pwa-install-prompt', () => null)
  const installed = useState<boolean>('pwa-installed', () => false)

  if (!import.meta.client) return

  if ('serviceWorker' in navigator) {
    const register = () => navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    prompt.value = event as BeforeInstallPromptEvent
  })

  window.addEventListener('appinstalled', () => {
    prompt.value = null
    installed.value = true
  })
})
