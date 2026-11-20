<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ContactRound, Plus, Search } from '@lucide/vue'
import type { Contact } from '~/types'
import PageHeader from '~/components/PageHeader.vue'
import UiCard from '~/components/ui/Card.vue'
import UiInput from '~/components/ui/Input.vue'
import UiButton from '~/components/ui/Button.vue'
import UiEmptyState from '~/components/ui/EmptyState.vue'
import UiConfirmModal from '~/components/ui/ConfirmModal.vue'
import ContactCard from '~/components/ContactCard.vue'
import ContactFormModal from '~/components/ContactFormModal.vue'
import { useContacts } from '~/composables/useContacts'
import { useWorkspace } from '~/composables/useWorkspace'

const contacts = useContacts()
const workspace = useWorkspace()

const search = ref('')
const modalOpen = ref(false)
const editing = ref<Contact | null>(null)
const toDelete = ref<Contact | null>(null)

onMounted(() => contacts.fetch())

const visible = computed(() => {
  const term = search.value.trim().toLowerCase()
  return contacts.items.value.filter((item) => !term || `${item.name} ${item.email} ${item.phone} ${item.role}`.toLowerCase().includes(term))
})

function openCreate() {
  editing.value = null
  modalOpen.value = true
}

function openEdit(contact: Contact) {
  editing.value = contact
  modalOpen.value = true
}

async function confirmDelete() {
  if (!toDelete.value) return
  await contacts.remove(toDelete.value.id)
  toDelete.value = null
}
</script>

<template>
  <div>
    <PageHeader title="Contacts" subtitle="Toutes les personnes utiles à votre déménagement.">
      <template #actions>
        <UiButton v-if="workspace.canWrite.value" @click="openCreate"><Plus class="size-4" />Nouveau contact</UiButton>
      </template>
    </PageHeader>

    <UiCard>
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ visible.length }} contact{{ visible.length > 1 ? 's' : '' }}</p>
        <UiInput v-model="search" placeholder="Rechercher un contact…" :icon="Search" class="w-full sm:w-64" />
      </div>

      <div v-if="visible.length" class="grid gap-3 md:grid-cols-2">
        <ContactCard v-for="contact in visible" :key="contact.id" :contact="contact" @edit="openEdit" @remove="toDelete = $event" />
      </div>
      <UiEmptyState v-else :icon="ContactRound" title="Aucun contact" description="Ajoutez un déménageur, une agence ou un proche.">
        <UiButton v-if="workspace.canWrite.value" size="sm" @click="openCreate"><Plus class="size-4" />Ajouter un contact</UiButton>
      </UiEmptyState>
    </UiCard>

    <ContactFormModal :open="modalOpen" :contact="editing" @close="modalOpen = false" />
    <UiConfirmModal
      :open="Boolean(toDelete)"
      title="Supprimer le contact ?"
      :message="`« ${toDelete?.name ?? ''} » sera définitivement supprimé.`"
      @cancel="toDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
