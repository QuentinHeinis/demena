<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CheckCircle2, ListTodo, Plus, Search } from '@lucide/vue'
import type { Task } from '~/types'
import PageHeader from '~/components/PageHeader.vue'
import UiCard from '~/components/ui/Card.vue'
import UiInput from '~/components/ui/Input.vue'
import UiButton from '~/components/ui/Button.vue'
import UiEmptyState from '~/components/ui/EmptyState.vue'
import UiConfirmModal from '~/components/ui/ConfirmModal.vue'
import TaskCard from '~/components/TaskCard.vue'
import TaskFormModal from '~/components/TaskFormModal.vue'
import { cn } from '~/utils/cn'
import { useTasks } from '~/composables/useTasks'
import { useWorkspace } from '~/composables/useWorkspace'

const tasks = useTasks()
const workspace = useWorkspace()

const filter = ref<'all' | 'pending' | 'done'>('all')
const search = ref('')
const modalOpen = ref(false)
const editing = ref<Task | null>(null)
const toDelete = ref<Task | null>(null)

onMounted(() => tasks.fetch())

const visible = computed(() => {
  const term = search.value.trim().toLowerCase()
  return tasks.items.value.filter((task) => {
    if (filter.value === 'pending' && task.done) return false
    if (filter.value === 'done' && !task.done) return false
    return !term || task.title.toLowerCase().includes(term) || task.description.toLowerCase().includes(term)
  })
})

const filters = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'À faire' },
  { value: 'done', label: 'Terminées' }
] as const

function openCreate() {
  editing.value = null
  modalOpen.value = true
}

function openEdit(task: Task) {
  editing.value = task
  modalOpen.value = true
}

async function confirmDelete() {
  if (!toDelete.value) return
  await tasks.remove(toDelete.value.id)
  toDelete.value = null
}
</script>

<template>
  <div>
    <PageHeader title="Tâches" subtitle="Tout ce qu’il reste à faire, au même endroit.">
      <template #actions>
        <UiButton v-if="workspace.canWrite.value" @click="openCreate"><Plus class="size-4" />Nouvelle tâche</UiButton>
      </template>
    </PageHeader>

    <div class="mb-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <UiInput v-model="search" placeholder="Rechercher une tâche…" :icon="Search" />
      <div class="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
        <button
          v-for="item in filters"
          :key="item.value"
          type="button"
          :class="cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            filter === item.value ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          )"
          @click="filter = item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="mb-4 flex items-center justify-between text-sm">
      <p class="text-slate-500 dark:text-slate-400">
        <span class="font-bold text-slate-800 dark:text-slate-100">{{ visible.length }}</span> tâche{{ visible.length > 1 ? 's' : '' }}
      </p>
      <p class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{{ tasks.completion.value }}% terminées</p>
    </div>

    <UiCard v-if="visible.length" :padded="false" class="p-3 sm:p-4">
      <div class="space-y-2">
        <TaskCard v-for="task in visible" :key="task.id" :task="task" @edit="openEdit" @remove="toDelete = $event" />
      </div>
    </UiCard>
    <UiEmptyState v-else :icon="filter === 'done' ? CheckCircle2 : ListTodo" title="Aucune tâche ici" description="Modifiez vos filtres ou ajoutez une nouvelle tâche.">
      <UiButton v-if="workspace.canWrite.value" size="sm" @click="openCreate"><Plus class="size-4" />Ajouter une tâche</UiButton>
    </UiEmptyState>

    <TaskFormModal :open="modalOpen" :task="editing" @close="modalOpen = false" />
    <UiConfirmModal
      :open="Boolean(toDelete)"
      title="Supprimer la tâche ?"
      :message="`« ${toDelete?.title ?? ''} » sera définitivement supprimée.`"
      @cancel="toDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
