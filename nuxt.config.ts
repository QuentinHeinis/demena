import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['@lucide/vue', '@supabase/ssr', '@supabase/supabase-js', 'clsx', 'tailwind-merge']
    }
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabasePublishableKey: process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
    }
  },

  app: {
    head: {
      title: 'Déména — Votre déménagement, organisé',
      meta: [
        { name: 'description', content: 'Tâches, budget, appartements et inventaire : tout votre déménagement au même endroit.' },
        { name: 'theme-color', content: '#4f46e5' }
      ]
    }
  }
})
