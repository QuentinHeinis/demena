import type { UserSettings } from '~/types'

export function useSettings() {
  const supabase = useSupabase()
  const auth = useAuth()
  const toast = useToast()

  const settings = useState<UserSettings | null>('user-settings', () => null)
  const loading = useState<boolean>('settings-loading', () => false)

  async function fetch() {
    if (!auth.user.value) return
    loading.value = true

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', auth.user.value.id)
      .maybeSingle()

    loading.value = false

    if (error) {
      toast.error(error.message)
      return
    }

    settings.value = (data as UserSettings | null) ?? null
  }

  async function save(payload: Partial<UserSettings>) {
    if (!auth.user.value) return null

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        ...payload,
        user_id: auth.user.value.id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      return null
    }

    settings.value = data as UserSettings

    if (payload.display_name !== undefined) {
      await supabase.from('profiles').update({ display_name: settings.value.display_name }).eq('id', auth.user.value.id)
    }

    toast.success('Profil enregistré.')
    return settings.value
  }

  return { settings, loading, fetch, save }
}
