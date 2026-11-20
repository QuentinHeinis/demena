<script setup lang="ts">
import { AlertCircle, CheckCircle2, Info, X } from '@lucide/vue'
import { cn } from '~/utils/cn'

const toast = useToast()

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
}

const styles = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-rose-600 dark:text-rose-400',
  info: 'text-brand-600 dark:text-brand-400'
}
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="item in toast.toasts.value"
          :key="item.id"
          class="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <component :is="icons[item.type]" :class="cn('mt-0.5 size-5 shrink-0', styles[item.type])" />
          <p class="flex-1 text-sm leading-snug text-slate-700 dark:text-slate-200">{{ item.message }}</p>
          <button type="button" class="text-slate-400 hover:text-slate-700 dark:hover:text-white" @click="toast.dismiss(item.id)">
            <X class="size-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
