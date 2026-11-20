<script setup lang="ts">
import { LogOut } from '@lucide/vue'
import { cn } from '~/utils/cn'
import { NAV_ITEMS, BRAND_ICON } from '~/utils/navigation'
import { initials } from '~/utils/format'
import { useAuth } from '~/composables/useAuth'
import { useWorkspace } from '~/composables/useWorkspace'
import { metaOf, WORKSPACE_ROLES } from '~/utils/constants'

const emit = defineEmits<{ navigate: [] }>()

const route = useRoute()
const auth = useAuth()
const workspace = useWorkspace()

const displayName = computed(() => {
  const meta = auth.user.value?.user_metadata
  return (meta?.display_name as string) || auth.user.value?.email?.split('@')[0] || 'Mon espace'
})
</script>

<template>
  <div class="flex h-full flex-col bg-white dark:bg-slate-900">
    <div class="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-5 dark:border-slate-800">
      <div class="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
        <component :is="BRAND_ICON" class="size-5" />
      </div>
      <div class="leading-tight">
        <p class="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">Déména</p>
        <p class="text-[10px] font-medium uppercase tracking-wider text-slate-400">Déménagement serein</p>
      </div>
    </div>

    <div class="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
      <select
        v-if="workspace.workspaces.value.length > 0"
        :value="workspace.activeId.value ?? ''"
        class="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        @change="workspace.select(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="item in workspace.workspaces.value" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
      <div v-if="workspace.role.value" class="mt-2 flex items-center justify-between px-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Espace actif</span>
        <UiBadge :label="metaOf(WORKSPACE_ROLES, workspace.role.value)?.label" :class="metaOf(WORKSPACE_ROLES, workspace.role.value)?.class" />
      </div>
    </div>

    <nav class="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-5">
      <p class="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Espace personnel</p>
      <NuxtLink
        v-for="item in NAV_ITEMS"
        :key="item.to"
        :to="item.to"
        :class="cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          route.path === item.to
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
        )"
        @click="emit('navigate')"
      >
        <component
          :is="item.icon"
          :class="cn('size-[18px] shrink-0', route.path === item.to ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200')"
        />
        <span class="flex-1">{{ item.label }}</span>
        <span v-if="route.path === item.to" class="size-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />
      </NuxtLink>
    </nav>

    <div class="shrink-0 border-t border-slate-100 p-3 dark:border-slate-800">
      <div class="flex items-center gap-3 rounded-xl px-2 py-2">
        <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold text-white">
          {{ initials(displayName) }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ displayName }}</p>
          <p class="truncate text-xs text-slate-400">{{ auth.user.value?.email }}</p>
        </div>
        <button
          type="button"
          title="Se déconnecter"
          class="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          @click="auth.signOut()"
        >
          <LogOut class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>
