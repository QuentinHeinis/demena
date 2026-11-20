<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  value: number
  hex?: string
  class?: string
  showLabel?: boolean
}>(), {})

const clamped = computed(() => Math.min(100, Math.max(0, Math.round(props.value))))
</script>

<template>
  <div :class="cn('w-full', props.class)">
    <div v-if="showLabel" class="mb-1.5 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
      <slot />
      <span>{{ clamped }}%</span>
    </div>
    <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="!hex && 'bg-brand-600 dark:bg-brand-500'"
        :style="{ width: `${clamped}%`, backgroundColor: hex }"
      />
    </div>
  </div>
</template>
