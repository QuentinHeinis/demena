<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Scale, Search, Wallet } from '@lucide/vue'
import type { Transaction } from '~/types'
import type { TransactionCategory } from '~/utils/constants'
import PageHeader from '~/components/PageHeader.vue'
import UiCard from '~/components/ui/Card.vue'
import UiInput from '~/components/ui/Input.vue'
import UiButton from '~/components/ui/Button.vue'
import UiProgress from '~/components/ui/Progress.vue'
import UiEmptyState from '~/components/ui/EmptyState.vue'
import UiConfirmModal from '~/components/ui/ConfirmModal.vue'
import StatCard from '~/components/StatCard.vue'
import TransactionRow from '~/components/TransactionRow.vue'
import TransactionFormModal from '~/components/TransactionFormModal.vue'
import BudgetFormModal from '~/components/BudgetFormModal.vue'
import { formatEuro } from '~/utils/format'
import { useBudgets } from '~/composables/useBudgets'
import { useTransactions } from '~/composables/useTransactions'
import { useWorkspace } from '~/composables/useWorkspace'

const budgets = useBudgets()
const transactions = useTransactions()
const workspace = useWorkspace()

const search = ref('')
const filter = ref<'all' | 'depense' | 'recette'>('all')
const modalOpen = ref(false)
const editing = ref<Transaction | null>(null)
const toDelete = ref<Transaction | null>(null)
const budgetModalOpen = ref(false)
const budgetCategory = ref<TransactionCategory | null>(null)

onMounted(async () => {
  await Promise.all([transactions.fetch(), budgets.fetch()])
})

const visible = computed(() => {
  const term = search.value.trim().toLowerCase()
  return transactions.items.value.filter((item) => {
    if (filter.value !== 'all' && item.type !== filter.value) return false
    return !term || item.label.toLowerCase().includes(term) || item.note.toLowerCase().includes(term)
  })
})

function openCreate() {
  editing.value = null
  modalOpen.value = true
}

function openEdit(item: Transaction) {
  editing.value = item
  modalOpen.value = true
}

function openBudget(category: TransactionCategory | null) {
  budgetCategory.value = category
  budgetModalOpen.value = true
}

async function confirmDelete() {
  if (!toDelete.value) return
  await transactions.remove(toDelete.value.id)
  toDelete.value = null
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Budget" subtitle="Suivez chaque euro de votre déménagement.">
      <template #actions>
        <UiButton variant="outline" :disabled="!workspace.canWrite.value" @click="openBudget(null)">
          <Wallet class="size-4" />Définir un budget
        </UiButton>
        <UiButton v-if="workspace.canWrite.value" @click="openCreate"><Plus class="size-4" />Nouvelle transaction</UiButton>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Dépenses" :value="formatEuro(transactions.totalExpenses.value)" :icon="ArrowUpRight" tone="rose" :hint="`${transactions.expenses.value.length} dépenses`" />
      <StatCard label="Recettes" :value="formatEuro(transactions.totalIncome.value)" :icon="ArrowDownLeft" tone="emerald" :hint="`${transactions.income.value.length} recettes`" />
      <StatCard label="Solde" :value="formatEuro(transactions.balance.value)" :icon="Scale" :tone="transactions.balance.value >= 0 ? 'emerald' : 'rose'" hint="Recettes − dépenses" />
      <StatCard label="Budget prévu" :value="formatEuro(budgets.totalPlanned.value)" :icon="Wallet" tone="brand" :hint="`${budgets.overview.value.length} enveloppes`" />
    </div>

    <UiCard v-if="budgets.overview.value.length">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Enveloppes par catégorie</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Comparez le prévu et le dépensé.</p>
        </div>
      </div>
      <div class="grid gap-5 md:grid-cols-2">
        <div v-for="category in budgets.overview.value" :key="category.value" class="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
          <div class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <span class="size-2 rounded-full" :style="{ backgroundColor: category.hex }" />{{ category.label }}
            </span>
            <button
              v-if="workspace.canWrite.value"
              type="button"
              class="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10"
              title="Modifier l’enveloppe"
              @click="openBudget(category.value)"
            >
              <Pencil class="size-3.5" />
            </button>
          </div>
          <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span class="font-bold text-slate-800 dark:text-slate-100">{{ formatEuro(category.spent) }}</span>
            /
            {{ formatEuro(category.planned) }}
          </p>
          <UiProgress :value="category.percent" :hex="category.percent > 100 ? '#f43f5e' : category.hex" class="mt-2" />
        </div>
      </div>
    </UiCard>

    <UiCard>
      <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Transactions</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ visible.length }} opération{{ visible.length > 1 ? 's' : '' }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UiInput v-model="search" placeholder="Rechercher…" :icon="Search" class="w-full sm:w-52" />
          <select v-model="filter" class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <option value="all">Toutes</option>
            <option value="depense">Dépenses</option>
            <option value="recette">Recettes</option>
          </select>
        </div>
      </div>

      <div v-if="visible.length">
        <TransactionRow v-for="item in visible" :key="item.id" :transaction="item" @edit="openEdit" @remove="toDelete = $event" />
      </div>
      <UiEmptyState v-else :icon="Wallet" title="Aucune transaction" description="Commencez par ajouter une dépense ou une recette.">
        <UiButton v-if="workspace.canWrite.value" size="sm" @click="openCreate"><Plus class="size-4" />Ajouter</UiButton>
      </UiEmptyState>
    </UiCard>

    <TransactionFormModal :open="modalOpen" :transaction="editing" @close="modalOpen = false" />
    <BudgetFormModal :open="budgetModalOpen" :category="budgetCategory" @close="budgetModalOpen = false" />
    <UiConfirmModal
      :open="Boolean(toDelete)"
      title="Supprimer la transaction ?"
      :message="`« ${toDelete?.label ?? ''} » sera définitivement supprimée.`"
      @cancel="toDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
