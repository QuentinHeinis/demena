import { PUSH_REMINDER_OPTIONS } from '~/utils/constants'

function urlBase64ToUint8Array(value: string): Uint8Array {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = `${value}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from(raw, (char) => char.charCodeAt(0))
}

export function usePush() {
  const config = useRuntimeConfig().public
  const supabase = useSupabase()
  const auth = useAuth()
  const toast = useToast()
  const reminders = useReminders()

  const supported = ref(false)
  const permission = ref<NotificationPermission>('default')
  const subscribed = ref(false)
  const loading = ref(false)

  const configured = computed(() => Boolean(config.vapidPublicKey))

  async function registration(): Promise<ServiceWorkerRegistration | null> {
    if (!import.meta.client || !('serviceWorker' in navigator)) return null
    try {
      return await navigator.serviceWorker.ready
    } catch {
      return null
    }
  }

  async function refresh() {
    if (!import.meta.client || !('Notification' in window)) return
    const reg = await registration()
    if (!reg || !('pushManager' in reg)) return
    supported.value = true
    permission.value = Notification.permission
    const existing = await reg.pushManager.getSubscription()
    subscribed.value = Boolean(existing)
  }

  async function enable() {
    if (!configured.value || !auth.user.value) {
      toast.error('Configuration push incomplète.')
      return false
    }

    loading.value = true
    try {
      const result = await Notification.requestPermission()
      permission.value = result
      if (result !== 'granted') {
        toast.error('Autorisation refusée : activez les notifications dans votre navigateur.')
        return false
      }

      const reg = await registration()
      if (!reg) {
        toast.error('Service worker indisponible.')
        return false
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey) as BufferSource
      })
      const json = subscription.toJSON()
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        toast.error('Abonnement push incomplet.')
        return false
      }

      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: auth.user.value.id,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        reminder_minutes: reminders.pushMinutes.value,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        device: navigator.userAgent.slice(0, 200)
      }, { onConflict: 'user_id,endpoint' })

      if (error) {
        toast.error(error.message)
        return false
      }

      subscribed.value = true
      toast.success('Notifications push activées.')
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible d’activer les notifications.')
      return false
    } finally {
      loading.value = false
    }
  }

  async function disable() {
    loading.value = true
    try {
      const reg = await registration()
      const existing = reg ? await reg.pushManager.getSubscription() : null
      if (existing) await existing.unsubscribe()

      if (auth.user.value) {
        const { error } = await supabase.from('push_subscriptions').delete().eq('user_id', auth.user.value.id)
        if (error) toast.error(error.message)
      }

      subscribed.value = false
      toast.info('Notifications push désactivées.')
    } finally {
      loading.value = false
    }
  }

  async function updateReminder(minutes: number) {
    if (!subscribed.value || !auth.user.value) return
    if (!PUSH_REMINDER_OPTIONS.some((option) => Number(option.value) === minutes)) return
    await supabase.from('push_subscriptions').update({ reminder_minutes: minutes }).eq('user_id', auth.user.value.id)
  }

  async function test() {
    loading.value = true
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) {
        toast.error('Connectez-vous pour tester les notifications.')
        return
      }

      const response = await fetch(`${config.supabaseUrl}/functions/v1/send-due-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ test: true })
      })

      if (response.ok) {
        toast.success('Notification de test envoyée.')
        return
      }

      const reg = await registration()
      if (reg) {
        if (reg.active) reg.active.postMessage({ type: 'TEST_NOTIFICATION' })
        else await reg.showNotification('Déména', { body: 'Les notifications sont activées.', icon: '/icon-192.png' })
      }
      toast.info('Edge Function non disponible : notification locale affichée.')
    } catch {
      toast.error('Impossible d’envoyer la notification de test.')
    } finally {
      loading.value = false
    }
  }

  return {
    supported,
    permission,
    subscribed,
    loading,
    configured,
    refresh,
    enable,
    disable,
    updateReminder,
    test
  }
}
