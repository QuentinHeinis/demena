<script setup lang="ts">
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from '@lucide/vue'
import type { Transaction } from '~/types'
import { TRANSACTION_CATEGORIES, metaOf } from '~/utils/constants'
import { formatDate, formatEuro } from '~/utils/format'
import { cn } from '~/utils/cn'
import UiBadge from '~/components/ui/Badge.vue'
import { useWorkspace } from '~/composables/useWorkspace'

const props = defineProps<{ transaction: Transaction }>()
const emit = defineEmits<{ edit: [transaction: Transaction], remove: [transaction: Transaction] }>()

const workspace = useWorkspace()
const category = computed(() => metaOf(TRANSACTION_CATEGORIES, props.transaction.category))
const isIncome = computed(() => props.transaction.type === 'recette')
</script>

<template>
  <div class="group flex items-center gap-3 border-b border-slate-100 px-1 py-3 last:border-0 dark:border-slate-800">
    <div :class="cn(
      'flex size-9 shrink-0 items-center justify-center rounded-xl',
      isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
    )">
      <ArrowDownLeft v-if="isIncome" class="size-4" />
      <ArrowUpRight v-else class="size-4" />
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ transaction.label }}</p>
      <div class="mt-1 flex flex-wrap items-center gap-2">
        <UiBadge :label="category?.label" :class="category?.class" />
        <span class="text-xs text-slate-400">{{ formatDate(transaction.date, { day: 'numeric', month: 'short' }) }}</span>
        <span v-if="transaction.note" class="hidden truncate text-xs text-slate-400 sm:inline">· {{ transaction.note }}</span>
      </div>
    </div>

    <p :class="cn('shrink-0 text-sm font-bold tabular-nums', isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100')">
      {{ isIncome ? '+' : '−' }}{{ formatEuro(transaction.amount) }}
    </p>

    <div v-if="workspace.canWrite.value" class="flex shrink-0 gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
      <button type="button" title="Modifier" class="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10" @click="emit('edit', transaction)">
        <Pencil class="size-4" />
      </button>
      <button type="button" title="Supprimer" class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" @click="emit('remove', transaction)">
        <Trash2 class="size-4" />
      </button>
    </div>
  </div>
</template>
