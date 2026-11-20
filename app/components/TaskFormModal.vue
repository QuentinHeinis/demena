<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Task } from '~/types'
import { TASK_CATEGORIES, TASK_PRIORITIES } from '~/utils/constants'
import { toDateInputValue } from '~/utils/format'
import UiModal from '~/components/ui/Modal.vue'
import UiInput from '~/components/ui/Input.vue'
import UiTextarea from '~/components/ui/Textarea.vue'
import UiSelect from '~/components/ui/Select.vue'
import UiButton from '~/components/ui/Button.vue'
import { useTasks } from '~/composables/useTasks'

const props = defineProps<{ open: boolean, task?: Task | null }>()
const emit = defineEmits<{ close: [] }>()

const tasks = useTasks()
const saving = ref(false)

const defaults = { title: '', description: '', category: 'administratif', priority: 'moyenne', due_date: '' }
const form = reactive({ ...defaults })

watch(() => props.open, (open) => {
  if (!open) return
  Object.assign(form, defaults, props.task ? {
    title: props.task.title,
    description: props.task.description,
    category: props.task.category,
    priority: props.task.priority,
    due_date: toDateInputValue(props.task.due_date)
  } : {})
})

async function submit() {
  if (!form.title.trim()) return
  saving.value = true

  const payload = {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    priority: form.priority,
    due_date: form.due_date || null
  }

  if (props.task) await tasks.update(props.task.id, payload)
  else await tasks.insert(payload)

  saving.value = false
  emit('close')
}
</script>

<template>
  <UiModal
    :open="open"
    :title="task ? 'Modifier la tâche' : 'Nouvelle tâche'"
    :description="task ? 'Mettez à jour les informations de cette tâche.' : 'Ajoutez une étape à votre déménagement.'"
    @close="emit('close')"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <UiInput v-model="form.title" label="Titre" placeholder="Ex. : Résilier mon assurance habitation" required autofocus />
      <UiTextarea v-model="form.description" label="Description" placeholder="Détails, numéro de dossier, rappel…" :rows="3" />
      <div class="grid gap-4 sm:grid-cols-2">
        <UiSelect v-model="form.category" label="Catégorie" :options="TASK_CATEGORIES" />
        <UiSelect v-model="form.priority" label="Priorité" :options="TASK_PRIORITIES" />
      </div>
      <UiInput v-model="form.due_date" label="Échéance" type="date" />

      <div class="flex justify-end gap-2 pt-2">
        <UiButton variant="ghost" type="button" @click="emit('close')">Annuler</UiButton>
        <UiButton type="submit" :loading="saving" :disabled="!form.title.trim()">
          {{ task ? 'Enregistrer' : 'Ajouter la tâche' }}
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
