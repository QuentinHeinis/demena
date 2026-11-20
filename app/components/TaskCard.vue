<script setup lang="ts">
import { CalendarDays, Check, Pencil, Trash2 } from '@lucide/vue'
import type { Task } from '~/types'
import { TASK_CATEGORIES, TASK_PRIORITIES, metaOf } from '~/utils/constants'
import { formatDateShort, isOverdue } from '~/utils/format'
import { cn } from '~/utils/cn'
import UiBadge from '~/components/ui/Badge.vue'
import { useTasks } from '~/composables/useTasks'
import { useWorkspace } from '~/composables/useWorkspace'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ edit: [task: Task], remove: [task: Task] }>()

const tasks = useTasks()
const workspace = useWorkspace()
const category = computed(() => metaOf(TASK_CATEGORIES, props.task.category))
const priority = computed(() => metaOf(TASK_PRIORITIES, props.task.priority))
const late = computed(() => !props.task.done && isOverdue(props.task.due_date))
</script>

<template>
  <div :class="cn(
    'group flex items-start gap-3 rounded-xl border p-3.5 transition-colors',
    task.done
      ? 'border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50'
      : 'border-slate-200 bg-white hover:border-brand-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40'
  )">
    <button
      type="button"
      :aria-label="task.done ? 'Marquer comme à faire' : 'Marquer comme terminée'"
      :disabled="!workspace.canWrite.value"
      :class="cn(
        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition',
        task.done
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-slate-300 text-transparent hover:border-brand-500 dark:border-slate-600'
      )"
      @click="tasks.toggle(task)"
    >
      <Check class="size-3.5" stroke-width="3" />
    </button>

    <div class="min-w-0 flex-1">
      <p :class="cn('text-sm font-semibold leading-snug', task.done ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-100')">
        {{ task.title }}
      </p>
      <p v-if="task.description" class="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {{ task.description }}
      </p>
      <div class="mt-2 flex flex-wrap items-center gap-1.5">
        <UiBadge :label="category?.label" :class="category?.class" />
        <UiBadge :label="priority?.label" :class="priority?.class" />
        <span v-if="task.due_date" :class="cn(
          'inline-flex items-center gap-1 text-xs font-medium',
          late ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'
        )">
          <CalendarDays class="size-3.5" />
          {{ formatDateShort(task.due_date) }}
          <span v-if="late">· en retard</span>
        </span>
      </div>
    </div>

    <div v-if="workspace.canWrite.value" class="flex shrink-0 gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
      <button type="button" title="Modifier" class="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10" @click="emit('edit', task)">
        <Pencil class="size-4" />
      </button>
      <button type="button" title="Supprimer" class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" @click="emit('remove', task)">
        <Trash2 class="size-4" />
      </button>
    </div>
  </div>
</template>
