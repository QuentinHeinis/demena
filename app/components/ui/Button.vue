<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'
import { cn } from '~/utils/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  variant?: Variant
  size?: Size
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  class?: string
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button'
})

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:outline-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:outline-slate-400 dark:text-slate-300 dark:hover:bg-slate-800',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:outline-rose-600'
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-sm'
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="cn(
      'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      variants[variant],
      sizes[size],
      block && 'w-full',
      props.class
    )"
  >
    <LoaderCircle v-if="loading" class="size-4 animate-spin" />
    <slot />
  </button>
</template>
