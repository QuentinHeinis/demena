<script setup lang="ts">
import { BellRing, CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Download, MapPin, Pencil, Plus, Trash2 } from '@lucide/vue'
import type { CalendarCustomEvent, CalendarEvent } from '~/types'
import PageHeader from '~/components/PageHeader.vue'
import UiButton from '~/components/ui/Button.vue'
import UiCard from '~/components/ui/Card.vue'
import UiEmptyState from '~/components/ui/EmptyState.vue'
import UiConfirmModal from '~/components/ui/ConfirmModal.vue'
import CalendarEventFormModal from '~/components/CalendarEventFormModal.vue'
import { CALENDAR_KINDS, EVENT_REMINDER_OPTIONS, labelOf, metaOf } from '~/utils/constants'
import { cn } from '~/utils/cn'
import { formatCalendarTime, parseCalendarDate } from '~/utils/format'
import { useCalendar } from '~/composables/useCalendar'
import { useWorkspace } from '~/composables/useWorkspace'

const calendar = useCalendar()
const workspace = useWorkspace()
const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const modalOpen = ref(false)
const editing = ref<CalendarCustomEvent | null>(null)
const toDelete = ref<CalendarEvent | null>(null)

const selectedDateLabel = computed(() => {
  const date = parseCalendarDate(calendar.selectedKey.value)
  if (!date) return ''
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)
})

function openCreate() {
  editing.value = null
  modalOpen.value = true
}

function openEdit(event: CalendarEvent) {
  editing.value = calendar.customEventFor(event)
  modalOpen.value = true
}

async function confirmDelete() {
  if (!toDelete.value) return
  await calendar.removeCustomEvent(toDelete.value)
  toDelete.value = null
}

onMounted(() => calendar.fetch())
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Calendrier" subtitle="Visites, échéances, rendez-vous libres et jour J au même endroit.">
      <template #actions>
        <UiButton variant="outline" size="sm" @click="calendar.goToday()"><CalendarDays class="size-4" />Aujourd’hui</UiButton>
        <UiButton v-if="workspace.canWrite.value" size="sm" @click="openCreate()"><Plus class="size-4" />Nouvel événement</UiButton>
        <UiButton size="sm" :loading="calendar.loading.value" @click="calendar.exportAll()"><Download class="size-4" />Exporter .ics</UiButton>
      </template>
    </PageHeader>

    <UiCard class="border-brand-200 bg-brand-50/60 dark:border-brand-500/30 dark:bg-brand-500/5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-400">
            <BellRing class="size-5" />
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">Recevoir des rappels sur votre téléphone</h2>
            <p class="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Exportez le calendrier, envoyez le fichier sur votre mobile et ouvrez-le avec l’application Calendrier d’Apple ou Google. Les rappels choisis dans les paramètres s’appliquent à tous les événements, sauf ceux où vous définissez un rappel personnalisé.
            </p>
          </div>
        </div>
        <NuxtLink to="/parametres" class="shrink-0 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Choisir le délai de rappel
        </NuxtLink>
      </div>
    </UiCard>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="kind in CALENDAR_KINDS"
        :key="kind.value"
        type="button"
        :class="cn(
          'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition',
          calendar.kinds.value.includes(kind.value)
            ? kind.class
            : 'bg-slate-50 text-slate-400 ring-slate-200 dark:bg-slate-800/50 dark:text-slate-500 dark:ring-slate-700'
        )"
        @click="calendar.toggleKind(kind.value)"
      >
        <span class="size-2 rounded-full" :style="{ backgroundColor: calendar.kinds.value.includes(kind.value) ? kind.hex : '#94a3b8' }" />
        {{ kind.label }}
      </button>
    </div>

    <UiCard class="overflow-hidden p-0">
      <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <button type="button" class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800" @click="calendar.moveMonth(-1)">
          <ChevronLeft class="size-5" />
        </button>
        <h2 class="text-sm font-bold capitalize text-slate-900 dark:text-white">{{ calendar.monthLabel.value }}</h2>
        <button type="button" class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800" @click="calendar.moveMonth(1)">
          <ChevronRight class="size-5" />
        </button>
      </div>

      <div class="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
        <div v-for="label in weekdays" :key="label" class="py-2">{{ label }}</div>
      </div>

      <div class="grid grid-cols-7">
        <button
          v-for="day in calendar.days.value"
          :key="day.key"
          type="button"
          :class="cn(
            'min-h-24 border-b border-r border-slate-100 p-1.5 text-left transition dark:border-slate-800',
            !day.inMonth && 'bg-slate-50/60 dark:bg-slate-900/40',
            day.key === calendar.selectedKey.value && 'bg-brand-50 ring-1 ring-inset ring-brand-300 dark:bg-brand-500/10 dark:ring-brand-500/40',
            day.key !== calendar.selectedKey.value && 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
          )"
          @click="calendar.selectDay(day.key)"
        >
          <span
            :class="cn(
              'mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold',
              day.isToday ? 'bg-brand-600 text-white' : day.inMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'
            )"
          >{{ day.date.getDate() }}</span>
          <span class="space-y-1">
            <span
              v-for="event in (calendar.eventsByKey.value.get(day.key) ?? []).slice(0, 2)"
              :key="event.id"
              :class="cn('block truncate rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset', metaOf(CALENDAR_KINDS, event.kind)?.class)"
            >{{ event.title }}</span>
            <span v-if="(calendar.eventsByKey.value.get(day.key)?.length ?? 0) > 2" class="block px-1.5 text-[10px] font-semibold text-slate-400">
              +{{ (calendar.eventsByKey.value.get(day.key)?.length ?? 0) - 2 }} autre(s)
            </span>
          </span>
        </button>
      </div>
    </UiCard>

    <UiCard>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-bold capitalize text-slate-900 dark:text-white">{{ selectedDateLabel }}</h2>
          <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{{ calendar.selectedEvents.value.length }} événement(s)</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UiButton v-if="workspace.canWrite.value" variant="outline" size="sm" @click="openCreate()"><Plus class="size-4" />Ajouter ici</UiButton>
          <UiButton variant="outline" size="sm" @click="calendar.exportAll()"><Download class="size-4" />Tout exporter</UiButton>
        </div>
      </div>

      <UiEmptyState
        v-if="!calendar.selectedEvents.value.length"
        :icon="CalendarDays"
        title="Aucun événement ce jour"
        description="Ajoutez un événement libre, une visite, une échéance ou la date du déménagement."
      >
        <UiButton v-if="workspace.canWrite.value" size="sm" @click="openCreate()"><Plus class="size-4" />Ajouter un événement</UiButton>
      </UiEmptyState>

      <div v-else class="space-y-2">
        <div
          v-for="event in calendar.selectedEvents.value"
          :key="event.id"
          :class="cn(
            'flex flex-wrap items-center gap-3 rounded-xl border p-3',
            event.done ? 'border-slate-100 bg-slate-50/60 opacity-60 dark:border-slate-800 dark:bg-slate-800/30' : 'border-slate-200 dark:border-slate-700'
          )"
        >
          <span class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: metaOf(CALENDAR_KINDS, event.kind)?.hex }" />
          <div class="min-w-0 flex-1">
            <p :class="cn('truncate text-sm font-semibold text-slate-800 dark:text-slate-100', event.done && 'line-through')">{{ event.title }}</p>
            <p class="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
              <component :is="event.kind === 'custom' ? CalendarDays : MapPin" class="size-3" />{{ event.subtitle }}
            </p>
          </div>
          <span v-if="event.kind === 'custom'" class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {{ labelOf(EVENT_REMINDER_OPTIONS, String(event.reminderMinutes ?? -1)) }}
          </span>
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ formatCalendarTime(event.date) }}</span>
          <UiButton variant="outline" size="sm" @click="calendar.exportOne(event)"><CalendarPlus class="size-4" />Ajouter</UiButton>
          <template v-if="event.kind === 'custom' && workspace.canWrite.value">
            <UiButton variant="outline" size="sm" @click="openEdit(event)"><Pencil class="size-4" />Modifier</UiButton>
            <UiButton variant="danger" size="sm" @click="toDelete = event"><Trash2 class="size-4" />Supprimer</UiButton>
          </template>
          <NuxtLink v-else :to="event.to" class="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">Ouvrir</NuxtLink>
        </div>
      </div>
    </UiCard>

    <CalendarEventFormModal
      :open="modalOpen"
      :event="editing"
      :date="calendar.selectedKey.value"
      @close="modalOpen = false"
    />
    <UiConfirmModal
      :open="Boolean(toDelete)"
      title="Supprimer l’événement ?"
      :message="`« ${toDelete?.title ?? ''} » sera définitivement supprimé.`"
      @cancel="toDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
