<script setup lang="ts">
import type { Component } from 'vue'
import UiCard from '~/components/ui/Card.vue'
import UiProgress from '~/components/ui/Progress.vue'
import { cn } from '~/utils/cn'

type Tone = 'brand' | 'emerald' | 'amber' | 'violet' | 'rose'

const props = withDefaults(defineProps<{
  label: string
  value: string
  icon: Component
  tone?: Tone
  hint?: string
  progress?: number
}>(), { tone: 'brand' })

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
}
</script>

<template>
  <UiCard>
    <div class="flex items-start justify-between gap-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ label }}</p>
      <div :class="cn('flex size-9 shrink-0 items-center justify-center rounded-xl', tones[props.tone])">
        <component :is="icon" class="size-[18px]" />
      </div>
    </div>
    <p class="mt-3 truncate text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{{ value }}</p>
    <p v-if="hint" class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{{ hint }}</p>
    <UiProgress v-if="progress !== undefined" :value="progress" class="mt-4" />
  </UiCard>
</template>
