<script setup lang="ts">
import type { Component } from 'vue'
import { cn } from '~/utils/cn'

withDefaults(defineProps<{
  modelValue: string | number | null
  label?: string
  type?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
  icon?: Component
  class?: string
}>(), { type: 'text' })

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }} <span v-if="required" class="text-rose-500">*</span>
    </span>
    <span class="relative block">
      <component :is="icon" v-if="icon" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        :value="modelValue ?? ''"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :min="min"
        :max="max"
        :step="step"
        :class="cn(
          'h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800',
          icon && 'pl-9',
          error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700',
          $props.class
        )"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </span>
    <p v-if="error" class="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{{ hint }}</p>
  </label>
</template>
