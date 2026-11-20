<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Contact } from '~/types'
import { CONTACT_ROLES } from '~/utils/constants'
import UiModal from '~/components/ui/Modal.vue'
import UiInput from '~/components/ui/Input.vue'
import UiTextarea from '~/components/ui/Textarea.vue'
import UiSelect from '~/components/ui/Select.vue'
import UiButton from '~/components/ui/Button.vue'
import { useContacts } from '~/composables/useContacts'

const props = defineProps<{ open: boolean, contact?: Contact | null }>()
const emit = defineEmits<{ close: [] }>()

const contacts = useContacts()
const saving = ref(false)

const defaults = () => ({ name: '', role: 'autre', phone: '', email: '', notes: '' })
const form = reactive(defaults())

watch(() => props.open, (open) => {
  if (!open) return
  Object.assign(form, defaults(), props.contact ? {
    name: props.contact.name,
    role: props.contact.role,
    phone: props.contact.phone,
    email: props.contact.email,
    notes: props.contact.notes
  } : {})
})

async function submit() {
  if (!form.name.trim()) return
  saving.value = true

  const payload = {
    name: form.name.trim(),
    role: form.role,
    phone: form.phone.trim(),
    email: form.email.trim(),
    notes: form.notes.trim()
  }

  if (props.contact) await contacts.update(props.contact.id, payload)
  else await contacts.insert(payload)

  saving.value = false
  emit('close')
}
</script>

<template>
  <UiModal :open="open" :title="contact ? 'Modifier le contact' : 'Nouveau contact'" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <UiInput v-model="form.name" label="Nom" placeholder="Ex. : Transports Martin" required />
        <UiSelect v-model="form.role" label="Rôle" :options="CONTACT_ROLES" />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <UiInput v-model="form.phone" label="Téléphone" type="tel" placeholder="06 00 00 00 00" />
        <UiInput v-model="form.email" label="Email" type="email" placeholder="contact@exemple.fr" />
      </div>
      <UiTextarea v-model="form.notes" label="Notes" :rows="3" placeholder="Détails utiles, devis, horaires…" />

      <div class="flex justify-end gap-2 pt-2">
        <UiButton variant="ghost" type="button" @click="emit('close')">Annuler</UiButton>
        <UiButton type="submit" :loading="saving" :disabled="!form.name.trim()">
          {{ contact ? 'Enregistrer' : 'Ajouter le contact' }}
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
