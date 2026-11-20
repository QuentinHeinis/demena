import type { Transaction } from '~/types'
import { TRANSACTION_CATEGORIES } from '~/utils/constants'

export function useTransactions() {
  const collection = useCollection<Transaction>('transactions')

  const expenses = computed(() => collection.items.value.filter((item) => item.type === 'depense'))
  const income = computed(() => collection.items.value.filter((item) => item.type === 'recette'))
  const totalExpenses = computed(() => expenses.value.reduce((sum, item) => sum + Number(item.amount), 0))
  const totalIncome = computed(() => income.value.reduce((sum, item) => sum + Number(item.amount), 0))
  const balance = computed(() => totalIncome.value - totalExpenses.value)

  const byCategory = computed(() => TRANSACTION_CATEGORIES
    .map((category) => ({
      ...category,
      total: expenses.value
        .filter((item) => item.category === category.value)
        .reduce((sum, item) => sum + Number(item.amount), 0)
    }))
    .filter((category) => category.total > 0)
    .sort((a, b) => b.total - a.total))

  return {
    ...collection,
    expenses,
    income,
    totalExpenses,
    totalIncome,
    balance,
    byCategory
  }
}
