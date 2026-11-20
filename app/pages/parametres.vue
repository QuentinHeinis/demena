<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { BellRing, Building2, LogOut, Plus, Smartphone, UserRound } from '@lucide/vue'
import PageHeader from '~/components/PageHeader.vue'
import UiCard from '~/components/ui/Card.vue'
import UiInput from '~/components/ui/Input.vue'
import UiButton from '~/components/ui/Button.vue'
import UiBadge from '~/components/ui/Badge.vue'
import UiSelect from '~/components/ui/Select.vue'
import { PUSH_REMINDER_OPTIONS, REMINDER_OPTIONS, WORKSPACE_ROLES, metaOf } from '~/utils/constants'
import { toDateInputValue } from '~/utils/format'
import { useSettings } from '~/composables/useSettings'
import { useWorkspace } from '~/composables/useWorkspace'
import { useAuth } from '~/composables/useAuth'
import { useReminders } from '~/composables/useReminders'
import { usePush } from '~/composables/usePush'

const settings = useSettings()
const workspace = useWorkspace()
const auth = useAuth()
const reminders = useReminders()
const push = usePush()

const savingProfile = ref(false)
const savingWorkspace = ref(false)
const newSpaceOpen = ref(false)
const newSpaceName = ref('')

const profileForm = reactive({ display_name: '', phone: '' })
const workspaceForm = reactive({ name: '', move_date: '', destination: '' })

const reminderValue = computed({
  get: () => reminders.minutes.value === null ? 'none' : String(reminders.minutes.value),
  set: (value: string) => reminders.set(value === 'none' ? null : Number(value))
})

const pushReminderValue = computed({
  get: () => String(reminders.pushMinutes.value),
  set: (value: string) => reminders.setPush(Number(value))
})

watch(() => reminders.pushMinutes.value, (value) => push.updateReminder(value))

onMounted(async () => {
  await Promise.all([settings.fetch(), workspace.fetch()])
  profileForm.display_name = settings.settings.value?.display_name ?? ''
  profileForm.phone = settings.settings.value?.phone ?? ''
  syncWorkspaceForm()
  push.refresh()
})

function syncWorkspaceForm() {
  workspaceForm.name = workspace.workspace.value?.name ?? ''
  workspaceForm.move_date = toDateInputValue(workspace.workspace.value?.move_date)
  workspaceForm.destination = workspace.workspace.value?.destination ?? ''
}

async function saveProfile() {
  savingProfile.value = true
  await settings.save({ display_name: profileForm.display_name.trim(), phone: profileForm.phone.trim() })
  savingProfile.value = false
}

async function saveWorkspace() {
  savingWorkspace.value = true
  await workspace.update({
    name: workspaceForm.name.trim(),
    move_date: workspaceForm.move_date || null,
    destination: workspaceForm.destination.trim()
  })
  savingWorkspace.value = false
}

async function createSpace() {
  if (!newSpaceName.value.trim()) return
  const created = await workspace.create(newSpaceName.value.trim())
  if (created) {
    newSpaceOpen.value = false
    newSpaceName.value = ''
    syncWorkspaceForm()
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Paramètres" subtitle="Votre profil et les informations de votre déménagement.">
      <template #actions>
        <UiButton variant="outline" @click="auth.signOut()"><LogOut class="size-4" />Se déconnecter</UiButton>
      </template>
    </PageHeader>

    <div class="grid gap-6 lg:grid-cols-2">
      <UiCard>
        <div class="mb-5 flex items-center gap-3">
          <div class="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <UserRound class="size-[18px]" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Profil personnel</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Visible par les membres de vos espaces.</p>
          </div>
        </div>

        <form class="space-y-4" @submit.prevent="saveProfile">
          <UiInput v-model="profileForm.display_name" label="Nom affiché" placeholder="Camille Dupont" />
          <UiInput v-model="profileForm.phone" label="Téléphone" type="tel" placeholder="06 00 00 00 00" />
          <UiInput :model-value="auth.user.value?.email ?? ''" label="Adresse email" disabled hint="L’adresse email est gérée par Supabase Auth." />
          <div class="flex justify-end pt-2">
            <UiButton type="submit" :loading="savingProfile">Enregistrer le profil</UiButton>
          </div>
        </form>
      </UiCard>

      <UiCard>
        <div class="mb-5 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <Building2 class="size-[18px]" />
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">Espace de déménagement</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Partagé avec les membres invités.</p>
            </div>
          </div>
          <UiBadge :label="metaOf(WORKSPACE_ROLES, workspace.role.value)?.label" :class="metaOf(WORKSPACE_ROLES, workspace.role.value)?.class" />
        </div>

        <form v-if="workspace.isOwner.value" class="space-y-4" @submit.prevent="saveWorkspace">
          <UiInput v-model="workspaceForm.name" label="Nom de l’espace" placeholder="Notre déménagement" required />
          <UiInput v-model="workspaceForm.move_date" label="Date du déménagement" type="date" />
          <UiInput v-model="workspaceForm.destination" label="Nouvelle adresse / ville" placeholder="Lyon 3e" />
          <div class="flex justify-end pt-2">
            <UiButton type="submit" :loading="savingWorkspace">Enregistrer l’espace</UiButton>
          </div>
        </form>
        <p v-else class="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          Seul le propriétaire de l’espace peut modifier ces informations. Vous êtes {{ metaOf(WORKSPACE_ROLES, workspace.role.value)?.label?.toLowerCase() }}.
        </p>
      </UiCard>
    </div>

    <UiCard>
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <BellRing class="size-[18px]" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Rappels du calendrier</h2>
            <p class="mt-1 max-w-xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Ce délai est ajouté aux événements exportés depuis le calendrier. Ouvrez le fichier .ics sur votre téléphone pour recevoir les notifications avec l’application Calendrier.
            </p>
          </div>
        </div>
        <div class="sm:w-56">
          <UiSelect v-model="reminderValue" label="Me rappeler" :options="REMINDER_OPTIONS" />
        </div>
      </div>
    </UiCard>

    <UiCard>
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex items-start gap-3">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Smartphone class="size-[18px]" />
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-bold text-slate-900 dark:text-white">Notifications push</h2>
              <span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" :class="push.subscribed.value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'">
                {{ push.subscribed.value ? 'Activées' : 'Désactivées' }}
              </span>
            </div>
            <p class="mt-1 max-w-xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Installez le site sur votre téléphone depuis le navigateur (Ajouter à l’écran d’accueil), puis activez les notifications : les alertes arrivent directement sur l’appareil, même quand le site est fermé.
            </p>
            <p v-if="!push.configured.value" class="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
              Ajoutez NUXT_PUBLIC_VAPID_PUBLIC_KEY dans .env et déployez la Edge Function avec ses secrets VAPID.
            </p>
            <p v-else-if="!push.supported.value" class="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
              Ce navigateur ne prend pas en charge les notifications push.
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-3 sm:w-64">
          <UiSelect v-model="pushReminderValue" label="Rappel push" :options="PUSH_REMINDER_OPTIONS" />
          <div class="flex flex-wrap gap-2">
            <UiButton v-if="!push.subscribed.value" size="sm" :loading="push.loading.value" :disabled="!push.configured.value || !push.supported.value" @click="push.enable()">Activer</UiButton>
            <template v-else>
              <UiButton variant="outline" size="sm" :loading="push.loading.value" @click="push.test()">Tester</UiButton>
              <UiButton variant="danger" size="sm" :loading="push.loading.value" @click="push.disable()">Désactiver</UiButton>
            </template>
          </div>
        </div>
      </div>
    </UiCard>

    <UiCard>
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Mes espaces</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Passez de l’un à l’autre depuis la barre latérale.</p>
        </div>
        <UiButton variant="outline" size="sm" @click="newSpaceOpen = !newSpaceOpen"><Plus class="size-4" />Nouvel espace</UiButton>
      </div>

      <div v-if="newSpaceOpen" class="mb-4 flex flex-wrap gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
        <UiInput v-model="newSpaceName" placeholder="Nom du nouvel espace" class="min-w-52 flex-1" />
        <UiButton size="sm" :disabled="!newSpaceName.trim()" @click="createSpace">Créer</UiButton>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="item in workspace.workspaces.value"
          :key="item.id"
          type="button"
          class="flex items-center gap-3 rounded-xl border p-3 text-left transition"
          :class="item.id === workspace.activeId.value ? 'border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10' : 'border-slate-200 hover:border-brand-200 dark:border-slate-700'"
          @click="workspace.select(item.id)"
        >
          <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-400">
            <Building2 class="size-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ item.name }}</p>
            <p class="truncate text-xs text-slate-400">{{ item.destination || 'Aucune destination' }}</p>
          </div>
          <span v-if="item.id === workspace.activeId.value" class="size-2 rounded-full bg-brand-600" />
        </button>
      </div>
    </UiCard>
  </div>
</template>
