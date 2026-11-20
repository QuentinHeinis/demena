<script setup lang="ts">
import { Bell, CalendarDays, Menu, Moon, Sun } from '@lucide/vue'
import { NAV_ITEMS } from '~/utils/navigation'
import { daysUntil } from '~/utils/format'
import { useTheme } from '~/composables/useTheme'
import { useCalendar } from '~/composables/useCalendar'

const emit = defineEmits<{ menu: [] }>()

const route = useRoute()
const theme = useTheme()
const calendar = useCalendar()
const notificationsOpen = ref(false)

const current = computed(() => NAV_ITEMS.find((item) => item.to === route.path) ?? NAV_ITEMS[0]!)

const upcoming = computed(() => calendar.events.value
  .filter((event) => !event.done)
  .map((event) => ({ event, days: daysUntil(event.date) }))
  .filter((item) => item.days !== null && item.days >= 0 && item.days <= 7)
  .sort((a, b) => (a.days ?? 99) - (b.days ?? 99) || a.event.date.localeCompare(b.event.date)))

function dayLabel(days: number | null): string {
  if (days === 0) return 'Aujourd’hui'
  if (days === 1) return 'Demain'
  return `Dans ${days} jour${days && days > 1 ? 's' : ''}`
}

onMounted(() => {
  if (!calendar.events.value.length) calendar.fetch()
})
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85 sm:px-6">
    <button
      type="button"
      class="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
      @click="emit('menu')"
    >
      <Menu class="size-5" />
    </button>

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-bold text-slate-900 dark:text-white sm:text-base">{{ current.title }}</p>
      <p class="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">{{ current.subtitle }}</p>
    </div>

    <div class="relative">
      <button
        type="button"
        title="Notifications"
        class="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-brand-400"
        @click="notificationsOpen = !notificationsOpen"
      >
        <Bell class="size-4" />
        <span
          v-if="upcoming.length"
          class="absolute -right-1.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
        >{{ upcoming.length }}</span>
      </button>

      <div v-if="notificationsOpen" class="fixed inset-0 z-40" @click="notificationsOpen = false" />

      <div v-if="notificationsOpen" class="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <p class="text-sm font-bold text-slate-900 dark:text-white">À venir</p>
          <span class="text-xs text-slate-400">{{ upcoming.length }} rappel(s)</span>
        </div>

        <div v-if="!upcoming.length" class="px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Rien de prévu dans les 7 prochains jours.
        </div>

        <div v-else class="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
          <NuxtLink
            v-for="item in upcoming"
            :key="item.event.id"
            :to="item.event.to"
            class="block px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
            @click="notificationsOpen = false"
          >
            <div class="flex items-start gap-3">
              <span class="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ item.event.title }}</p>
                <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ item.event.subtitle }}</p>
              </div>
              <span class="shrink-0 text-[11px] font-semibold text-brand-600 dark:text-brand-400">{{ dayLabel(item.days) }}</span>
            </div>
          </NuxtLink>
        </div>

        <NuxtLink to="/calendrier" class="flex items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-xs font-semibold text-brand-600 hover:bg-slate-50 dark:border-slate-800 dark:text-brand-400 dark:hover:bg-slate-800/60" @click="notificationsOpen = false">
          <CalendarDays class="size-3.5" />Voir le calendrier
        </NuxtLink>
      </div>
    </div>

    <button
      type="button"
      :title="theme.isDark.value ? 'Mode clair' : 'Mode sombre'"
      class="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-brand-400"
      @click="theme.toggle()"
    >
      <Sun v-if="theme.isDark.value" class="size-4" />
      <Moon v-else class="size-4" />
    </button>
  </header>
</template>
