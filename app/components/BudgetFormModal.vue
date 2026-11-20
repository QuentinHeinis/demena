<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { TRANSACTION_CATEGORIES, type TransactionCategory } from '~/utils/constants'
import UiModal from '~/components/ui/Modal.vue'
import UiInput from '~/components/ui/Input.vue'
import UiSelect from '~/components/ui/Select.vue'
import UiButton from '~/components/ui/Button.vue'
import { useBudgets } from '~/composables/useBudgets'

const props = defineProps<{ open: boolean, category?: TransactionCategory | null }>()
const emit = defineEmits<{ close: [] }>()

const budgets = useBudgets()
const saving = ref(false)
const form = reactive({ category: 'demenageur', amount: '' })

watch(() => props.open, (open) => {
  if (!open) return
  form.category = props.category ?? 'demenageur'
  const existing = budgets.items.value.find((item) => item.category === form.category)
  form.amount = existing ? String(existing.amount) : ''
})

watch(() => form.category, (category) => {
  const existing = budgets.items.value.find((item) => item.category === category)
  form.amount = existing ? String(existing.amount) : ''
})

async function submit() {
  const amount = Number(form.amount)
  if (!(amount >= 0)) return
  saving.value = true
  await budgets.save(form.category as TransactionCategory, amount)
  saving.value = false
  emit('close')
}
</script>

<template>
  <UiModal :open="open" title="Budget par catégorie" description="Définissez le montant que vous souhaitez allouer." size="sm" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <UiSelect v-model="form.category" label="Catégorie" :options="TRANSACTION_CATEGORIES" />
      <UiInput v-model="form.amount" label="Montant prévu (€)" type="number" min="0" step="0.01" placeholder="0,00" required />
      <p class="text-xs text-slate-500 dark:text-slate-400">Laissez 0 pour retirer l’enveloppe de cette catégorie.</p>

      <div class="flex justify-end gap-2 pt-2">
        <UiButton variant="ghost" type="button" @click="emit('close')">Annuler</UiButton>
        <UiButton type="submit" :loading="saving">Enregistrer</UiButton>
      </div>
    </form>
  </UiModal>
</template>
