<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Apartment } from '~/types'
import { APARTMENT_KINDS, APARTMENT_STATUSES } from '~/utils/constants'
import UiModal from '~/components/ui/Modal.vue'
import UiInput from '~/components/ui/Input.vue'
import UiTextarea from '~/components/ui/Textarea.vue'
import UiSelect from '~/components/ui/Select.vue'
import UiButton from '~/components/ui/Button.vue'
import { useApartments } from '~/composables/useApartments'

const props = defineProps<{ open: boolean, apartment?: Apartment | null }>()
const emit = defineEmits<{ close: [] }>()

const apartments = useApartments()
const saving = ref(false)

function toLocalInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function defaults() {
  return {
    title: '', address: '', city: '', postal_code: '', surface: '', rooms: '',
    price: '', charges: '', deposit: '', kind: 'location', status: 'a_visiter',
    rating: '0', visit_date: '', listing_url: '', contact_name: '', contact_phone: '',
    contact_email: '', pros: '', cons: '', notes: ''
  }
}

const form = reactive(defaults())
const ratingOptions = [0, 1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: value === 0 ? 'Non évalué' : `${value} / 5` }))

watch(() => props.open, (open) => {
  if (!open) return
  Object.assign(form, defaults(), props.apartment ? {
    title: props.apartment.title,
    address: props.apartment.address,
    city: props.apartment.city,
    postal_code: props.apartment.postal_code,
    surface: props.apartment.surface === null ? '' : String(props.apartment.surface),
    rooms: props.apartment.rooms === null ? '' : String(props.apartment.rooms),
    price: String(props.apartment.price),
    charges: String(props.apartment.charges),
    deposit: String(props.apartment.deposit),
    kind: props.apartment.kind,
    status: props.apartment.status,
    rating: String(props.apartment.rating),
    visit_date: toLocalInput(props.apartment.visit_date),
    listing_url: props.apartment.listing_url,
    contact_name: props.apartment.contact_name,
    contact_phone: props.apartment.contact_phone,
    contact_email: props.apartment.contact_email,
    pros: props.apartment.pros,
    cons: props.apartment.cons,
    notes: props.apartment.notes
  } : {})
})

async function submit() {
  if (!form.title.trim()) return
  saving.value = true

  const payload = {
    title: form.title.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    postal_code: form.postal_code.trim(),
    surface: form.surface === '' ? null : Number(form.surface),
    rooms: form.rooms === '' ? null : Number(form.rooms),
    price: Number(form.price) || 0,
    charges: Number(form.charges) || 0,
    deposit: Number(form.deposit) || 0,
    kind: form.kind,
    status: form.status,
    rating: Number(form.rating),
    visit_date: form.visit_date ? new Date(form.visit_date).toISOString() : null,
    listing_url: form.listing_url.trim(),
    contact_name: form.contact_name.trim(),
    contact_phone: form.contact_phone.trim(),
    contact_email: form.contact_email.trim(),
    pros: form.pros.trim(),
    cons: form.cons.trim(),
    notes: form.notes.trim()
  }

  if (props.apartment) await apartments.update(props.apartment.id, payload)
  else await apartments.insert(payload)

  saving.value = false
  emit('close')
}
</script>

<template>
  <UiModal
    :open="open"
    size="lg"
    :title="apartment ? 'Modifier le logement' : 'Ajouter un logement'"
    description="Gardez toutes les informations de vos visites au même endroit."
    @close="emit('close')"
  >
    <form class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <UiInput v-model="form.title" label="Nom du logement" placeholder="Ex. : Studio rue des Lilas" required class="sm:col-span-2" />
        <UiInput v-model="form.address" label="Adresse" placeholder="12 rue des Lilas" />
        <div class="grid grid-cols-2 gap-3">
          <UiInput v-model="form.postal_code" label="Code postal" placeholder="75020" />
          <UiInput v-model="form.city" label="Ville" placeholder="Paris" />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-4">
        <UiSelect v-model="form.kind" label="Type" :options="APARTMENT_KINDS" />
        <UiSelect v-model="form.status" label="Statut" :options="APARTMENT_STATUSES" />
        <UiInput v-model="form.surface" label="Surface (m²)" type="number" min="0" step="0.1" />
        <UiInput v-model="form.rooms" label="Pièces" type="number" min="0" step="1" />
      </div>

      <div class="grid gap-4 sm:grid-cols-4">
        <UiInput v-model="form.price" label="Prix (€)" type="number" min="0" step="0.01" />
        <UiInput v-model="form.charges" label="Charges (€)" type="number" min="0" step="0.01" />
        <UiInput v-model="form.deposit" label="Caution (€)" type="number" min="0" step="0.01" />
        <UiSelect v-model="form.rating" label="Note" :options="ratingOptions" />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UiInput v-model="form.visit_date" label="Date de visite" type="datetime-local" />
        <UiInput v-model="form.listing_url" label="Lien de l’annonce" type="url" placeholder="Lien vers l’annonce" />
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <UiInput v-model="form.contact_name" label="Contact" placeholder="Nom de l’agence" />
        <UiInput v-model="form.contact_phone" label="Téléphone" type="tel" placeholder="06 00 00 00 00" />
        <UiInput v-model="form.contact_email" label="Email" type="email" placeholder="contact@exemple.fr" />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UiTextarea v-model="form.pros" label="Points forts" :rows="3" placeholder="Lumineux, proche métro…" />
        <UiTextarea v-model="form.cons" label="Points faibles" :rows="3" placeholder="Bruyant, petite cuisine…" />
      </div>

      <UiTextarea v-model="form.notes" label="Notes" :rows="2" placeholder="Impressions générales, questions à poser…" />

      <div class="flex justify-end gap-2 pt-2">
        <UiButton variant="ghost" type="button" @click="emit('close')">Annuler</UiButton>
        <UiButton type="submit" :loading="saving" :disabled="!form.title.trim()">
          {{ apartment ? 'Enregistrer' : 'Ajouter le logement' }}
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
