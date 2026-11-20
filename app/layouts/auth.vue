<script setup lang="ts">
import { BRAND_ICON } from '~/utils/navigation'
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-slate-950">
    <div class="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-600/20" />
    <div class="pointer-events-none absolute -bottom-40 -right-24 size-96 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-700/20" />

    <div class="relative z-10 w-full max-w-md">
      <NuxtLink to="/" class="mb-8 flex items-center justify-center gap-3">
        <div class="flex size-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/25">
          <component :is="BRAND_ICON" class="size-6" />
        </div>
        <div class="text-left leading-tight">
          <p class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Déména</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-slate-400">Déménagement serein</p>
        </div>
      </NuxtLink>

      <slot />

      <p class="mt-8 text-center text-xs text-slate-400">Vos données restent privées à votre espace.</p>
    </div>
  </div>
</template>
