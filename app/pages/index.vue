<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { ArrowRight, Building2, CalendarDays, CircleCheck, ListTodo, Package, Sparkles, UsersRound, Wallet } from '@lucide/vue'
import UiCard from '~/components/ui/Card.vue'
import UiButton from '~/components/ui/Button.vue'
import UiBadge from '~/components/ui/Badge.vue'
import UiProgress from '~/components/ui/Progress.vue'
import UiEmptyState from '~/components/ui/EmptyState.vue'
import StatCard from '~/components/StatCard.vue'
import TaskCard from '~/components/TaskCard.vue'
import { daysUntilLabel, formatEuro } from '~/utils/format'
import { WORKSPACE_ROLES, metaOf } from '~/utils/constants'
import { useWorkspace } from '~/composables/useWorkspace'
import { useTasks } from '~/composables/useTasks'
import { useTransactions } from '~/composables/useTransactions'
import { useBudgets } from '~/composables/useBudgets'
import { useApartments } from '~/composables/useApartments'
import { useBoxes } from '~/composables/useBoxes'
import { useSettings } from '~/composables/useSettings'

const workspace = useWorkspace()
const tasks = useTasks()
const transactions = useTransactions()
const budgets = useBudgets()
const apartments = useApartments()
const boxes = useBoxes()
const settings = useSettings()

onMounted(async () => {
  await Promise.all([
    workspace.fetch(),
    tasks.fetch(),
    transactions.fetch(),
    budgets.fetch(),
    apartments.fetch(),
    boxes.fetch(),
    settings.fetch()
  ])
})

const greeting = computed(() => settings.settings.value?.display_name?.split(' ')[0] || 'vous')
const budgetProgress = computed(() => {
  const planned = budgets.totalPlanned.value
  return planned > 0 ? Math.round((transactions.totalExpenses.value / planned) * 100) : 0
})
const upcomingTasks = computed(() => tasks.pending.value.slice(0, 5))
</script>

<template>
  <div class="space-y-6">
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 p-6 text-white shadow-lg shadow-brand-700/20 sm:p-8">
      <div class="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border-[3rem] border-white/10" />
      <div class="pointer-events-none absolute -bottom-24 right-32 size-48 rounded-full border-[2rem] border-white/10" />

      <div class="relative">
        <div class="flex flex-wrap items-center gap-2">
          <UiBadge class="bg-white/15 text-white ring-white/20" :label="metaOf(WORKSPACE_ROLES, workspace.role.value)?.label" />
          <span v-if="workspace.workspaces.value.length > 1" class="text-xs text-white/70">{{ workspace.workspaces.value.length }} espaces partagés</span>
        </div>

        <p class="mt-4 text-sm font-medium text-brand-100">Bonjour {{ greeting }}</p>
        <h1 class="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{{ workspace.workspace.value?.name ?? 'Votre déménagement' }}</h1>
        <p v-if="workspace.workspace.value?.destination" class="mt-2 flex items-center gap-2 text-sm text-brand-100">
          <Building2 class="size-4" />Destination : {{ workspace.workspace.value.destination }}
        </p>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 backdrop-blur-sm">
            <CalendarDays class="size-4" />
            <span class="text-sm font-semibold">{{ daysUntilLabel(workspace.workspace.value?.move_date) }}</span>
          </div>
          <NuxtLink to="/equipe">
            <UiButton variant="secondary" size="sm" class="bg-white/15 text-white hover:bg-white/25 dark:bg-white/15 dark:text-white dark:hover:bg-white/25">
              <UsersRound class="size-4" />Gérer l’équipe
            </UiButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Tâches" :value="`${tasks.pending.value.length} à faire`" :icon="ListTodo" tone="brand" :hint="`${tasks.completion.value}% terminées`" :progress="tasks.completion.value" />
      <StatCard label="Budget dépensé" :value="formatEuro(transactions.totalExpenses.value)" :icon="Wallet" tone="rose" :hint="`sur ${formatEuro(budgets.totalPlanned.value)} planifiés`" :progress="budgetProgress" />
      <StatCard label="Appartements" :value="`${apartments.items.value.length} suivis`" :icon="Building2" tone="violet" :hint="`${apartments.shortlist.value.length} dans la shortlist`" />
      <StatCard label="Cartons" :value="`${boxes.progress.value}% prêts`" :icon="Package" tone="amber" :hint="`${boxes.items.value.length} cartons au total`" :progress="boxes.progress.value" />
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <UiCard class="lg:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Prochaines tâches</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Ce qui vous attend le plus</p>
          </div>
          <NuxtLink to="/taches" class="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
            Tout voir <ArrowRight class="size-3.5" />
          </NuxtLink>
        </div>

        <div v-if="upcomingTasks.length" class="space-y-2">
          <TaskCard v-for="task in upcomingTasks" :key="task.id" :task="task" />
        </div>
        <UiEmptyState v-else :icon="Sparkles" title="Tout est à jour !" description="Aucune tâche en attente dans cet espace.">
          <NuxtLink to="/taches"><UiButton size="sm">Ajouter une tâche</UiButton></NuxtLink>
        </UiEmptyState>
      </UiCard>

      <UiCard>
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Où va votre budget</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Dépenses par catégorie</p>
          </div>
          <NuxtLink to="/budget" class="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">Détails</NuxtLink>
        </div>

        <div v-if="transactions.byCategory.value.length" class="space-y-4">
          <div v-for="category in transactions.byCategory.value.slice(0, 5)" :key="category.value">
            <UiProgress :value="transactions.totalExpenses.value ? (category.total / transactions.totalExpenses.value) * 100 : 0" :hex="category.hex">
              <span class="truncate">{{ category.label }}</span>
            </UiProgress>
            <p class="mt-1.5 text-right text-xs font-semibold text-slate-700 dark:text-slate-200">{{ formatEuro(category.total) }}</p>
          </div>
        </div>
        <UiEmptyState v-else :icon="CircleCheck" title="Aucune dépense" description="Ajoutez vos premières dépenses pour voir la répartition." class="py-8">
          <NuxtLink to="/budget"><UiButton size="sm" variant="outline">Ajouter une dépense</UiButton></NuxtLink>
        </UiEmptyState>

        <div class="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-slate-400">Solde global</span>
            <span class="font-bold" :class="transactions.balance.value >= 0 ? 'text-emerald-600' : 'text-rose-600'">{{ formatEuro(transactions.balance.value) }}</span>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
