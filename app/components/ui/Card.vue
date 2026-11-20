<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  padded?: boolean
  class?: string
}>(), { padded: true })
</script>

<template>
  <div :class="cn(
    'rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
    padded && 'p-5 sm:p-6',
    props.class
  )">
    <slot />
  </div>
</template>
