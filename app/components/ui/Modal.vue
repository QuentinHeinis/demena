<script setup lang="ts">
import { X } from '@lucide/vue'
import { cn } from '~/utils/cn'

type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description?: string
  size?: Size
}>(), { size: 'md' })

const emit = defineEmits<{ close: [] }>()

const sizes: Record<Size, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl'
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

watch(() => props.open, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="emit('close')" />
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        :class="cn(
          'relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-2xl',
          sizes[size]
        )"
      >
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ title }}</h2>
            <p v-if="description" class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{{ description }}</p>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            @click="emit('close')"
          >
            <X class="size-5" />
          </button>
        </div>

        <div class="scrollbar-thin overflow-y-auto px-5 py-5 dark:text-slate-200 sm:px-6">
          <slot />
        </div>

        <div v-if="$slots.footer" class="border-t border-slate-100 bg-slate-50/60 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
