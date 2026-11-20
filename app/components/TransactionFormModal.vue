<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Transaction } from '~/types'
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES } from '~/utils/constants'
import { toDateInputValue } from '~/utils/format'
import UiModal from '~/components/ui/Modal.vue'
import UiInput from '~/components/ui/Input.vue'
import UiTextarea from '~/components/ui/Textarea.vue'
import UiSelect from '~/components/ui/Select.vue'
import UiButton from '~/components/ui/Button.vue'
import { useTransactions } from '~/composables/useTransactions'

const props = defineProps<{ open: boolean, transaction?: Transaction | null }>()
const emit = defineEmits<{ close: [] }>()

const transactions = useTransactions()
const saving = ref(false)

function today() {
  return new Date().toISOString().slice(0, 10)
}

const defaults = () => ({ label: '', amount: '' as string, type: 'depense', category: 'demenageur', date: today(), note: '' })
const form = reactive(defaults())

watch(() => props.open, (open) => {
  if (!open) return
  Object.assign(form, defaults(), props.transaction ? {
    label: props.transaction.label,
    amount: String(props.transaction.amount),
    type: props.transaction.type,
    category: props.transaction.category,
    date: toDateInputValue(props.transaction.date),
    note: props.transaction.note
  } : {})
})

async function submit() {
  const amount = Number(form.amount)
  if (!form.label.trim() || !(amount > 0)) return
  saving.value = true

  const payload = {
    label: form.label.trim(),
    amount,
    type: form.type,
    category: form.category,
    date: form.date,
    note: form.note.trim()
  }

  if (props.transaction) await transactions.update(props.transaction.id, payload)
  else await transactions.insert(payload)

  saving.value = false
  emit('close')
}
</script>

<template>
  <UiModal
    :open="open"
    :title="transaction ? 'Modifier la transaction' : 'Nouvelle transaction'"
    :description="'Enregistrez une dépense ou une recette liée à votre déménagement.'"
    @close="emit('close')"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <UiInput v-model="form.label" label="Libellé" placeholder="Ex. : Facture déménageur" required />
      <div class="grid gap-4 sm:grid-cols-2">
        <UiInput v-model="form.amount" label="Montant (€)" type="number" min="0" step="0.01" placeholder="0,00" required />
        <UiInput v-model="form.date" label="Date" type="date" required />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <UiSelect v-model="form.type" label="Type" :options="TRANSACTION_TYPES" />
        <UiSelect v-model="form.category" label="Catégorie" :options="TRANSACTION_CATEGORIES" />
      </div>
      <UiTextarea v-model="form.note" label="Note (facultatif)" :rows="2" placeholder="Précisions sur cette transaction…" />

      <div class="flex justify-end gap-2 pt-2">
        <UiButton variant="ghost" type="button" @click="emit('close')">Annuler</UiButton>
        <UiButton type="submit" :loading="saving" :disabled="!form.label.trim() || !(Number(form.amount) > 0)">
          {{ transaction ? 'Enregistrer' : 'Ajouter' }}
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
