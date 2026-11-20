<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  label?: string
  hex?: string
  dot?: boolean
  class?: string
}>(), {})

const style = computed(() => (props.hex ? { backgroundColor: props.hex } : undefined))
</script>

<template>
  <span :class="cn(
    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
    props.class ?? 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/40'
  )">
    <span v-if="dot || hex" class="size-1.5 shrink-0 rounded-full" :style="style" />
    <slot>{{ label }}</slot>
  </span>
</template>
