<script setup lang="ts">
const mobileOpen = ref(false)
const config = useRuntimeConfig().public
const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey)
</script>

<template>
  <div class="min-h-screen">
    <div v-if="!configured" class="bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-amber-950">
      Supabase n’est pas configuré : copiez .env.example vers .env et renseignez vos clés.
    </div>
    <AppSidebar :open="mobileOpen" @close="mobileOpen = false" />
    <div class="lg:pl-64">
      <AppHeader @menu="mobileOpen = true" />
      <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
