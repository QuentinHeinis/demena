<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import { cn } from '~/utils/cn'

withDefaults(defineProps<{
  modelValue: string
  label?: string
  options: readonly { value: string, label: string }[]
  placeholder?: string
  required?: boolean
  class?: string
}>(), {})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }} <span v-if="required" class="text-rose-500">*</span>
    </span>
    <span class="relative block">
      <select
        :value="modelValue"
        :required="required"
        :class="cn(
          'h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
          $props.class
        )"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
      <ChevronDown class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
    </span>
  </label>
</template>
