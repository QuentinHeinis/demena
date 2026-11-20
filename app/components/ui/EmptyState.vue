<script setup lang="ts">
import type { Component } from 'vue'
import { Inbox } from '@lucide/vue'
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  icon?: Component
  title: string
  description?: string
  class?: string
}>(), { icon: Inbox })
</script>

<template>
  <div :class="cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center dark:border-slate-700', props.class)">
    <div class="mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
      <component :is="props.icon" class="size-6" />
    </div>
    <p class="font-semibold text-slate-800 dark:text-slate-100">{{ title }}</p>
    <p v-if="description" class="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5"><slot /></div>
  </div>
</template>
