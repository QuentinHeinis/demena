<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Package, Plus } from '@lucide/vue'
import type { MovingBox } from '~/types'
import PageHeader from '~/components/PageHeader.vue'
import UiCard from '~/components/ui/Card.vue'
import UiButton from '~/components/ui/Button.vue'
import UiProgress from '~/components/ui/Progress.vue'
import UiEmptyState from '~/components/ui/EmptyState.vue'
import UiConfirmModal from '~/components/ui/ConfirmModal.vue'
import BoxCard from '~/components/BoxCard.vue'
import BoxFormModal from '~/components/BoxFormModal.vue'
import { useBoxes } from '~/composables/useBoxes'
import { useWorkspace } from '~/composables/useWorkspace'

const boxes = useBoxes()
const workspace = useWorkspace()

const modalOpen = ref(false)
const editing = ref<MovingBox | null>(null)
const toDelete = ref<MovingBox | null>(null)

onMounted(() => boxes.fetch())

function openCreate() {
  editing.value = null
  modalOpen.value = true
}

function openEdit(box: MovingBox) {
  editing.value = box
  modalOpen.value = true
}

async function confirmDelete() {
  if (!toDelete.value) return
  await boxes.remove(toDelete.value.id)
  toDelete.value = null
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Cartons" subtitle="Votre inventaire, du rangement à l’installation.">
      <template #actions>
        <UiButton v-if="workspace.canWrite.value" @click="openCreate"><Plus class="size-4" />Nouveau carton</UiButton>
      </template>
    </PageHeader>

    <UiCard>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Progression</p>
          <p class="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{{ boxes.progress.value }}% prêts</p>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ boxes.items.value.length }} carton{{ boxes.items.value.length > 1 ? 's' : '' }} au total</p>
      </div>
      <UiProgress :value="boxes.progress.value" class="mt-4" />
    </UiCard>

    <template v-if="boxes.items.value.length">
      <UiCard v-for="group in boxes.grouped.value" :key="group.value">
        <div class="mb-4 flex items-center gap-2">
          <span class="size-2 rounded-full" :style="{ backgroundColor: group.hex }" />
          <h2 class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ group.label }}</h2>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{{ group.boxes.length }}</span>
        </div>
        <div v-if="group.boxes.length" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <BoxCard v-for="box in group.boxes" :key="box.id" :box="box" @edit="openEdit" @remove="toDelete = $event" />
        </div>
        <p v-else class="text-sm text-slate-400">Aucun carton dans cette catégorie.</p>
      </UiCard>
    </template>
    <UiEmptyState v-else :icon="Package" title="Aucun carton" description="Créez vos cartons pièce par pièce pour ne rien oublier le jour J.">
      <UiButton v-if="workspace.canWrite.value" size="sm" @click="openCreate"><Plus class="size-4" />Ajouter un carton</UiButton>
    </UiEmptyState>

    <BoxFormModal :open="modalOpen" :box="editing" @close="modalOpen = false" />
    <UiConfirmModal
      :open="Boolean(toDelete)"
      title="Supprimer le carton ?"
      :message="`« ${toDelete?.label ?? ''} » sera définitivement supprimé.`"
      @cancel="toDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
