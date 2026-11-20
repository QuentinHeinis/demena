<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  subtitle?: string
}>(), {})
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ subtitle }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
