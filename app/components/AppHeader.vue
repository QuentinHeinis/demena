<script setup lang="ts">
import { Menu, Moon, Sun } from '@lucide/vue'
import { NAV_ITEMS } from '~/utils/navigation'
import { useTheme } from '~/composables/useTheme'

const emit = defineEmits<{ menu: [] }>()

const route = useRoute()
const theme = useTheme()

const current = computed(() => NAV_ITEMS.find((item) => item.to === route.path) ?? NAV_ITEMS[0]!)
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
