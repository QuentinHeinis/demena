<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { MovingBox } from '~/types'
import { BOX_ROOMS, BOX_STATUSES } from '~/utils/constants'
import UiModal from '~/components/ui/Modal.vue'
import UiInput from '~/components/ui/Input.vue'
import UiTextarea from '~/components/ui/Textarea.vue'
import UiSelect from '~/components/ui/Select.vue'
import UiButton from '~/components/ui/Button.vue'
import { useBoxes } from '~/composables/useBoxes'

const props = defineProps<{ open: boolean, box?: MovingBox | null }>()
const emit = defineEmits<{ close: [] }>()

const boxes = useBoxes()
const saving = ref(false)

const defaults = () => ({ label: '', room: 'cuisine', status: 'a_emballer', fragile: false, notes: '' })
const form = reactive(defaults())

watch(() => props.open, (open) => {
  if (!open) return
  Object.assign(form, defaults(), props.box ? {
    label: props.box.label,
    room: props.box.room,
    status: props.box.status,
    fragile: props.box.fragile,
    notes: props.box.notes
  } : {})
})

async function submit() {
  if (!form.label.trim()) return
  saving.value = true

  const payload = {
    label: form.label.trim(),
    room: form.room,
    status: form.status,
    fragile: form.fragile,
    notes: form.notes.trim()
  }

  if (props.box) await boxes.update(props.box.id, payload)
  else await boxes.insert(payload)

  saving.value = false
  emit('close')
}
</script>

<template>
  <UiModal :open="open" :title="box ? 'Modifier le carton' : 'Nouveau carton'" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <UiInput v-model="form.label" label="Nom du carton" placeholder="Ex. : Livres bibliothèque" required />
      <div class="grid gap-4 sm:grid-cols-2">
        <UiSelect v-model="form.room" label="Pièce d’origine" :options="BOX_ROOMS" />
        <UiSelect v-model="form.status" label="Statut" :options="BOX_STATUSES" />
      </div>
      <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <input v-model="form.fragile" type="checkbox" class="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
        <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Objets fragiles</span>
      </label>
      <UiTextarea v-model="form.notes" label="Contenu / notes" :rows="3" placeholder="Ce qu’il y a dans ce carton…" />

      <div class="flex justify-end gap-2 pt-2">
        <UiButton variant="ghost" type="button" @click="emit('close')">Annuler</UiButton>
        <UiButton type="submit" :loading="saving" :disabled="!form.label.trim()">
          {{ box ? 'Enregistrer' : 'Ajouter le carton' }}
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
