<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Building2, CalendarDays, Heart, Plus, Search } from '@lucide/vue'
import type { Apartment } from '~/types'
import type { ApartmentStatus } from '~/utils/constants'
import PageHeader from '~/components/PageHeader.vue'
import UiCard from '~/components/ui/Card.vue'
import UiInput from '~/components/ui/Input.vue'
import UiButton from '~/components/ui/Button.vue'
import UiEmptyState from '~/components/ui/EmptyState.vue'
import UiConfirmModal from '~/components/ui/ConfirmModal.vue'
import StatCard from '~/components/StatCard.vue'
import ApartmentCard from '~/components/ApartmentCard.vue'
import ApartmentFormModal from '~/components/ApartmentFormModal.vue'
import { APARTMENT_STATUSES } from '~/utils/constants'
import { cn } from '~/utils/cn'
import { formatEuro } from '~/utils/format'
import { useApartments } from '~/composables/useApartments'
import { useWorkspace } from '~/composables/useWorkspace'

const apartments = useApartments()
const workspace = useWorkspace()

const search = ref('')
const statusFilter = ref<'all' | ApartmentStatus>('all')
const modalOpen = ref(false)
const editing = ref<Apartment | null>(null)
const toDelete = ref<Apartment | null>(null)

onMounted(() => apartments.fetch())

const visible = computed(() => {
  const term = search.value.trim().toLowerCase()
  return apartments.items.value.filter((item) => {
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
    return !term || `${item.title} ${item.city} ${item.address}`.toLowerCase().includes(term)
  })
})

function openCreate() {
  editing.value = null
  modalOpen.value = true
}

function openEdit(item: Apartment) {
  editing.value = item
  modalOpen.value = true
}

async function confirmDelete() {
  if (!toDelete.value) return
  await apartments.remove(toDelete.value.id)
  toDelete.value = null
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Appartements" subtitle="Vos annonces, visites et coups de cœur.">
      <template #actions>
        <UiButton v-if="workspace.canWrite.value" @click="openCreate"><Plus class="size-4" />Ajouter un logement</UiButton>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Logements suivis" :value="String(apartments.items.value.length)" :icon="Building2" tone="brand" />
      <StatCard label="À visiter" :value="String(apartments.counts.value.find((item) => item.value === 'a_visiter')?.count ?? 0)" :icon="CalendarDays" tone="amber" />
      <StatCard label="Shortlist" :value="String(apartments.shortlist.value.length)" :icon="Heart" tone="rose" />
      <StatCard label="Loyer moyen" :value="formatEuro(apartments.averageRent.value)" :icon="Building2" tone="violet" />
    </div>

    <UiCard>
      <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-1.5">
          <button
            type="button"
            :class="cn(
              'rounded-full px-3 py-1.5 text-xs font-semibold transition',
              statusFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )"
            @click="statusFilter = 'all'"
          >
            Tous ({{ apartments.items.value.length }})
          </button>
          <button
            v-for="status in APARTMENT_STATUSES"
            :key="status.value"
            type="button"
            :class="cn(
              'rounded-full px-3 py-1.5 text-xs font-semibold transition',
              statusFilter === status.value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )"
            @click="statusFilter = status.value"
          >
            {{ status.label }} ({{ apartments.counts.value.find((item) => item.value === status.value)?.count ?? 0 }})
          </button>
        </div>
        <UiInput v-model="search" placeholder="Rechercher une annonce…" :icon="Search" class="w-full lg:w-60" />
      </div>

      <div v-if="visible.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ApartmentCard v-for="item in visible" :key="item.id" :apartment="item" @edit="openEdit" @remove="toDelete = $event" />
      </div>
      <UiEmptyState v-else :icon="Building2" title="Aucun logement" description="Ajoutez une annonce pour suivre vos visites et comparer les offres.">
        <UiButton v-if="workspace.canWrite.value" size="sm" @click="openCreate"><Plus class="size-4" />Ajouter un logement</UiButton>
      </UiEmptyState>
    </UiCard>

    <ApartmentFormModal :open="modalOpen" :apartment="editing" @close="modalOpen = false" />
    <UiConfirmModal
      :open="Boolean(toDelete)"
      title="Supprimer ce logement ?"
      :message="`« ${toDelete?.title ?? ''} » sera définitivement supprimé.`"
      @cancel="toDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
