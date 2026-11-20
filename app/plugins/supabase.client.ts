import { createBrowserClient } from '@supabase/ssr'

export default defineNuxtPlugin(() => {
  const { public: config } = useRuntimeConfig()

  const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey)

  if (!configured) {
    console.warn('[Déména] Variables Supabase manquantes : copiez .env.example vers .env et renseignez l\'URL et la clé publishable (sb_publishable_...).')
  }

  const supabase = createBrowserClient(
    config.supabaseUrl || 'http://localhost:54321',
    config.supabasePublishableKey || 'sb_publishable_placeholder'
  )

  return {
    provide: { supabase }
  }
})
