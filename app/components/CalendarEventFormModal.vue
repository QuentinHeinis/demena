<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { CalendarCustomEvent } from '~/types'
import { EVENT_REMINDER_OPTIONS } from '~/utils/constants'
import UiModal from '~/components/ui/Modal.vue'
import UiInput from '~/components/ui/Input.vue'
import UiTextarea from '~/components/ui/Textarea.vue'
import UiSelect from '~/components/ui/Select.vue'
import UiButton from '~/components/ui/Button.vue'
import { useCalendar } from '~/composables/useCalendar'

const props = defineProps<{ open: boolean, event?: CalendarCustomEvent | null, date?: string }>()
const emit = defineEmits<{ close: [] }>()

const calendar = useCalendar()
const saving = ref(false)

function defaults() {
  return { title: '', description: '', date: props.date || calendar.todayKey.value, time: '', allDay: true, reminder: '-1' }
}

const form = reactive(defaults())

function fillFrom(value: string) {
  const parts = value.split('T')
  form.date = parts[0] || calendar.todayKey.value
  form.time = parts[1]?.slice(0, 5) ?? ''
  form.allDay = !form.time
}

watch(() => props.open, (open) => {
  if (!open) return
  Object.assign(form, defaults())
  if (props.event) {
    form.title = props.event.title
    form.description = props.event.description
    form.reminder = String(props.event.reminder_minutes)
    fillFrom(props.event.date)
  }
})

function ensureTime() {
  if (!form.allDay && !form.time) form.time = '09:00'
}

async function submit() {
  if (!form.title.trim() || !form.date) return
  saving.value = true

  const payload = {
    title: form.title.trim(),
    description: form.description.trim(),
    date: form.allDay || !form.time ? form.date : `${form.date}T${form.time}`,
    all_day: form.allDay,
    reminder_minutes: Number(form.reminder)
  }

  if (props.event) await calendar.customEvents.update(props.event.id, payload)
  else await calendar.customEvents.insert(payload)

  saving.value = false
  emit('close')
}
</script>

<template>
  <UiModal
    :open="open"
    :title="event ? 'Modifier l’événement' : 'Nouvel événement'"
    :description="event ? 'Mettez à jour cet événement du calendrier.' : 'Ajoutez un rendez-vous ou un rappel qui n’est lié à aucune tâche.'"
    @close="emit('close')"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <UiInput v-model="form.title" label="Titre" placeholder="Ex. : Rendez-vous chez le notaire" required autofocus />
      <UiTextarea v-model="form.description" label="Description" placeholder="Détails, adresse, numéro de dossier…" :rows="3" />
      <div class="grid gap-4 sm:grid-cols-2">
        <UiInput v-model="form.date" label="Date" type="date" required />
        <UiInput v-if="!form.allDay" v-model="form.time" label="Heure" type="time" />
      </div>
      <label class="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        <input v-model="form.allDay" type="checkbox" class="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" @change="ensureTime" />
        Toute la journée
      </label>
      <UiSelect v-model="form.reminder" label="Rappel" :options="EVENT_REMINDER_OPTIONS" />
      <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        Ce rappel s’applique à cet événement dans le calendrier exporté et dans les notifications push. « Rappel des paramètres » suit le délai global.
      </p>

      <div class="flex justify-end gap-2 pt-2">
        <UiButton variant="ghost" type="button" @click="emit('close')">Annuler</UiButton>
        <UiButton type="submit" :loading="saving" :disabled="!form.title.trim() || !form.date">
          {{ event ? 'Enregistrer' : 'Ajouter l’événement' }}
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
