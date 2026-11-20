import type { Budget } from '~/types'
import { TRANSACTION_CATEGORIES, type TransactionCategory } from '~/utils/constants'
import { useTransactions } from '~/composables/useTransactions'

export function useBudgets() {
  const collection = useCollection<Budget>('budgets')
  const transactions = useTransactions()

  const totalPlanned = computed(() => collection.items.value.reduce((sum, budget) => sum + Number(budget.amount), 0))

  const overview = computed(() => TRANSACTION_CATEGORIES.map((category) => {
    const planned = Number(collection.items.value.find((budget) => budget.category === category.value)?.amount ?? 0)
    const spent = transactions.expenses.value
      .filter((item) => item.category === category.value)
      .reduce((sum, item) => sum + Number(item.amount), 0)
    const percent = planned > 0 ? Math.round((spent / planned) * 100) : 0

    return { ...category, planned, spent, percent }
  }).filter((category) => category.planned > 0 || category.spent > 0))

  async function save(category: TransactionCategory, amount: number) {
    const existing = collection.items.value.find((budget) => budget.category === category)
    if (existing) return collection.update(existing.id, { amount })
    return collection.insert({ category, amount })
  }

  return { ...collection, totalPlanned, overview, save }
}
