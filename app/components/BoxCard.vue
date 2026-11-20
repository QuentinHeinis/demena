<script setup lang="ts">
import { MapPin, Pencil, Trash2, TriangleAlert } from '@lucide/vue'
import type { MovingBox } from '~/types'
import { BOX_ROOMS, BOX_STATUSES, metaOf } from '~/utils/constants'
import { cn } from '~/utils/cn'
import UiBadge from '~/components/ui/Badge.vue'
import { useWorkspace } from '~/composables/useWorkspace'

const props = defineProps<{ box: MovingBox }>()
const emit = defineEmits<{ edit: [box: MovingBox], remove: [box: MovingBox] }>()

const workspace = useWorkspace()
const status = computed(() => metaOf(BOX_STATUSES, props.box.status))
</script>

<template>
  <div :class="cn(
    'group flex items-start gap-3 rounded-xl border bg-white p-4 transition dark:bg-slate-900',
    box.status === 'devide' ? 'border-emerald-200 dark:border-emerald-500/30' : 'border-slate-200 dark:border-slate-700'
  )">
    <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
      <span class="text-sm font-bold">{{ box.label.trim().charAt(0).toUpperCase() || '?' }}</span>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <p class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ box.label }}</p>
        <TriangleAlert v-if="box.fragile" class="size-3.5 text-rose-500" title="Fragile" />
      </div>
      <div class="mt-1.5 flex flex-wrap items-center gap-2">
        <UiBadge :label="status?.label" :class="status?.class" />
        <span v-if="box.room" class="inline-flex items-center gap-1 text-xs text-slate-400">
          <MapPin class="size-3" />{{ metaOf(BOX_ROOMS, box.room)?.label ?? box.room }}
        </span>
      </div>
      <p v-if="box.notes" class="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{{ box.notes }}</p>
    </div>

    <div v-if="workspace.canWrite.value" class="flex shrink-0 gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
      <button type="button" title="Modifier" class="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10" @click="emit('edit', box)">
        <Pencil class="size-4" />
      </button>
      <button type="button" title="Supprimer" class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" @click="emit('remove', box)">
        <Trash2 class="size-4" />
      </button>
    </div>
  </div>
</template>
