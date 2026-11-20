<script setup lang="ts">
import { AlertTriangle } from '@lucide/vue'
import UiModal from '~/components/ui/Modal.vue'
import UiButton from '~/components/ui/Button.vue'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
}>(), {
  title: 'Confirmer la suppression',
  confirmLabel: 'Supprimer',
  danger: true
})

const emit = defineEmits<{ confirm: [], cancel: [] }>()
</script>

<template>
  <UiModal :open="props.open" :title="props.title" size="sm" @close="emit('cancel')">
    <div class="flex gap-4">
      <div :class="[
        'flex size-10 shrink-0 items-center justify-center rounded-full',
        props.danger ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
      ]">
        <AlertTriangle class="size-5" />
      </div>
      <p class="pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ props.message }}</p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton variant="ghost" @click="emit('cancel')">Annuler</UiButton>
        <UiButton :variant="props.danger ? 'danger' : 'primary'" :loading="props.loading" @click="emit('confirm')">
          {{ props.confirmLabel }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
