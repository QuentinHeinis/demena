<script setup lang="ts">
import { BedDouble, CalendarDays, ExternalLink, MapPin, Pencil, Ruler, Star, Trash2 } from '@lucide/vue'
import type { Apartment } from '~/types'
import { APARTMENT_KINDS, APARTMENT_STATUSES, metaOf } from '~/utils/constants'
import { formatDateTime, formatEuro } from '~/utils/format'
import { cn } from '~/utils/cn'
import UiBadge from '~/components/ui/Badge.vue'
import { useWorkspace } from '~/composables/useWorkspace'

const props = defineProps<{ apartment: Apartment }>()
const emit = defineEmits<{ edit: [apartment: Apartment], remove: [apartment: Apartment] }>()

const workspace = useWorkspace()
const status = computed(() => metaOf(APARTMENT_STATUSES, props.apartment.status))
const kind = computed(() => metaOf(APARTMENT_KINDS, props.apartment.kind))
</script>

<template>
  <div class="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="truncate text-base font-bold text-slate-900 dark:text-white">{{ apartment.title }}</h3>
        <p class="mt-1 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
          <MapPin class="size-3.5 shrink-0" />
          <span class="truncate">{{ [apartment.address, apartment.postal_code, apartment.city].filter(Boolean).join(', ') || 'Adresse non renseignée' }}</span>
        </p>
      </div>
      <div v-if="workspace.canWrite.value" class="flex shrink-0 gap-0.5">
        <button type="button" title="Modifier" class="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10" @click="emit('edit', apartment)">
          <Pencil class="size-4" />
        </button>
        <button type="button" title="Supprimer" class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" @click="emit('remove', apartment)">
          <Trash2 class="size-4" />
        </button>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-1.5">
      <UiBadge :label="status?.label" :class="status?.class" />
      <UiBadge :label="kind?.label" />
      <span v-if="apartment.rating > 0" class="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
        <Star v-for="n in apartment.rating" :key="n" class="size-3.5 fill-current" />
      </span>
    </div>

    <div class="mt-4 flex items-end justify-between gap-3">
      <div>
        <p class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {{ formatEuro(apartment.price) }}<span v-if="apartment.kind === 'location'" class="text-xs font-medium text-slate-400"> / mois</span>
        </p>
        <p v-if="apartment.charges > 0" class="text-xs text-slate-400">+ {{ formatEuro(apartment.charges) }} de charges</p>
      </div>
      <div class="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span v-if="apartment.surface" class="inline-flex items-center gap-1"><Ruler class="size-3.5" />{{ apartment.surface }} m²</span>
        <span v-if="apartment.rooms" class="inline-flex items-center gap-1"><BedDouble class="size-3.5" />{{ apartment.rooms }} p.</span>
      </div>
    </div>

    <div v-if="apartment.visit_date || apartment.listing_url" class="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
      <span v-if="apartment.visit_date" :class="cn('inline-flex items-center gap-1.5', new Date(apartment.visit_date) >= new Date() ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400')">
        <CalendarDays class="size-3.5" />{{ formatDateTime(apartment.visit_date) }}
      </span>
      <a v-if="apartment.listing_url" :href="apartment.listing_url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-400">
        <ExternalLink class="size-3.5" />Annonce
      </a>
    </div>

    <div v-if="apartment.pros || apartment.cons || apartment.notes" class="mt-3 space-y-1.5 text-xs">
      <p v-if="apartment.pros" class="text-emerald-600 dark:text-emerald-400"><span class="font-semibold">+ </span>{{ apartment.pros }}</p>
      <p v-if="apartment.cons" class="text-rose-600 dark:text-rose-400"><span class="font-semibold">− </span>{{ apartment.cons }}</p>
      <p v-if="apartment.notes" class="text-slate-500 dark:text-slate-400">{{ apartment.notes }}</p>
    </div>

    <p v-if="apartment.contact_name" class="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
      Contact : <span class="font-medium text-slate-700 dark:text-slate-200">{{ apartment.contact_name }}</span>
      <span v-if="apartment.contact_phone"> · {{ apartment.contact_phone }}</span>
    </p>
  </div>
</template>
