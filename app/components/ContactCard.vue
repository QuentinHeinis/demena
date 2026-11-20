<script setup lang="ts">
import { Mail, Pencil, Phone, Trash2 } from '@lucide/vue'
import type { Contact } from '~/types'
import { CONTACT_ROLES, metaOf } from '~/utils/constants'
import { initials } from '~/utils/format'
import UiBadge from '~/components/ui/Badge.vue'
import { useWorkspace } from '~/composables/useWorkspace'

const props = defineProps<{ contact: Contact }>()
const emit = defineEmits<{ edit: [contact: Contact], remove: [contact: Contact] }>()

const workspace = useWorkspace()
const role = computed(() => metaOf(CONTACT_ROLES, props.contact.role))
</script>

<template>
  <div class="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40">
    <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold text-white">
      {{ initials(contact.name) }}
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ contact.name }}</p>
      <div class="mt-1 flex flex-wrap items-center gap-2">
        <UiBadge :label="role?.label" :class="role?.class" />
        <a v-if="contact.phone" :href="`tel:${contact.phone}`" class="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400">
          <Phone class="size-3" />{{ contact.phone }}
        </a>
        <a v-if="contact.email" :href="`mailto:${contact.email}`" class="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400">
          <Mail class="size-3" />{{ contact.email }}
        </a>
      </div>
      <p v-if="contact.notes" class="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{{ contact.notes }}</p>
    </div>

    <div v-if="workspace.canWrite.value" class="flex shrink-0 gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
      <button type="button" title="Modifier" class="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10" @click="emit('edit', contact)">
        <Pencil class="size-4" />
      </button>
      <button type="button" title="Supprimer" class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" @click="emit('remove', contact)">
        <Trash2 class="size-4" />
      </button>
    </div>
  </div>
</template>
