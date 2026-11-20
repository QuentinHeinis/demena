import type { User } from '@supabase/supabase-js'

let initPromise: Promise<void> | null = null

export function useAuth() {
  const supabase = useSupabase()
  const toast = useToast()

  const user = useState<User | null>('auth-user', () => null)
  const ready = useState<boolean>('auth-ready', () => false)
  const pending = useState<boolean>('auth-pending', () => false)
  const error = useState<string | null>('auth-error', () => null)

  function initialize(): Promise<void> {
    if (ready.value) return Promise.resolve()
    if (initPromise) return initPromise

    initPromise = (async () => {
      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null
        ready.value = true
      })

      const { data } = await supabase.auth.getSession()
      user.value = data.session?.user ?? null
      ready.value = true
    })()

    return initPromise
  }

  async function signIn(email: string, password: string): Promise<{ success: boolean, message?: string }> {
    pending.value = true
    error.value = null

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    pending.value = false

    if (err) {
      error.value = err.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect.'
        : err.message
      toast.error(error.value!)
      return { success: false, message: error.value! }
    }

    user.value = data.user
    ready.value = true
    toast.success('Bienvenue !')
    return { success: true }
  }

  async function signUp(email: string, password: string, displayName = ''): Promise<{ success: boolean, needsConfirmation: boolean, message?: string }> {
    pending.value = true
    error.value = null

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    })
    pending.value = false

    if (err) {
      error.value = err.message
      toast.error(err.message)
      return { success: false, needsConfirmation: false, message: err.message }
    }

    if (data.session) {
      user.value = data.user
      ready.value = true
      toast.success('Votre espace est prêt !')
      return { success: true, needsConfirmation: false }
    }

    toast.info('Vérifiez votre boîte mail pour activer votre compte.')
    return { success: true, needsConfirmation: true }
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    toast.info('Vous êtes déconnecté.')
    await navigateTo('/login')
  }

  async function requestPasswordReset(email: string): Promise<{ success: boolean, message?: string }> {
    pending.value = true
    error.value = null
    const { error: err } = await supabase.auth.resetPasswordForEmail(email)
    pending.value = false

    if (err) {
      error.value = err.message
      toast.error(err.message)
      return { success: false, message: err.message }
    }

    toast.success('Lien de réinitialisation envoyé par email.')
    return { success: true }
  }

  return {
    user,
    ready,
    pending,
    error,
    initialize,
    signIn,
    signUp,
    signOut,
    requestPasswordReset
  }
}
