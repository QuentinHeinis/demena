<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Copy, Link2, Mail, ShieldCheck, Trash2, UserRoundPlus } from '@lucide/vue'
import type { WorkspaceRole } from '~/types'
import PageHeader from '~/components/PageHeader.vue'
import UiCard from '~/components/ui/Card.vue'
import UiBadge from '~/components/ui/Badge.vue'
import UiButton from '~/components/ui/Button.vue'
import UiModal from '~/components/ui/Modal.vue'
import UiInput from '~/components/ui/Input.vue'
import UiSelect from '~/components/ui/Select.vue'
import UiConfirmModal from '~/components/ui/ConfirmModal.vue'
import { INVITE_ROLES, WORKSPACE_ROLES, metaOf } from '~/utils/constants'
import { formatDate, initials } from '~/utils/format'
import { useTeam } from '~/composables/useTeam'
import { useWorkspace } from '~/composables/useWorkspace'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'

const team = useTeam()
const workspace = useWorkspace()
const auth = useAuth()
const toast = useToast()

const inviteOpen = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<'editor' | 'viewer'>('editor')
const inviting = ref(false)
const lastLink = ref('')
const toRemove = ref<string | null>(null)

onMounted(() => team.fetch())

async function submitInvite() {
  if (!inviteEmail.value.trim()) return
  inviting.value = true
  const token = await team.invite(inviteEmail.value, inviteRole.value)
  inviting.value = false
  if (!token) return
  lastLink.value = team.invitationLink(token)
  inviteEmail.value = ''
  await navigator.clipboard?.writeText(lastLink.value).then(() => toast.success('Lien copié dans le presse-papiers.')).catch(() => {})
}

async function copyLink(link: string) {
  try {
    await navigator.clipboard.writeText(link)
    toast.success('Lien copié dans le presse-papiers.')
  } catch {
    toast.error('Copie impossible : sélectionnez le lien manuellement.')
  }
}

async function changeRole(userId: string, event: Event) {
  const role = (event.target as HTMLSelectElement).value as WorkspaceRole
  await team.updateRole(userId, role)
}

async function confirmRemove() {
  if (!toRemove.value) return
  await team.removeMember(toRemove.value)
  toRemove.value = null
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Équipe & accès" subtitle="Partagez votre espace avec les bonnes personnes.">
      <template #actions>
        <UiButton v-if="workspace.isOwner.value" @click="inviteOpen = true"><UserRoundPlus class="size-4" />Inviter quelqu’un</UiButton>
      </template>
    </PageHeader>

    <UiCard class="border-brand-200 bg-brand-50/60 dark:border-brand-500/30 dark:bg-brand-500/5">
      <div class="flex gap-3">
        <ShieldCheck class="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400" />
        <div class="text-sm text-slate-600 dark:text-slate-300">
          <p class="font-semibold text-slate-800 dark:text-white">Trois niveaux d’accès</p>
          <p class="mt-1">
            <strong>Propriétaire</strong> : gère les droits, les invitations et l’espace.
            <strong>Éditeur</strong> : ajoute et modifie tout le contenu.
            <strong>Lecteur</strong> : consulte sans rien modifier.
          </p>
        </div>
      </div>
    </UiCard>

    <UiCard>
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Membres de « {{ workspace.workspace.value?.name }} »</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ team.members.value.length }} personne{{ team.members.value.length > 1 ? 's' : '' }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <div v-for="member in team.members.value" :key="member.user_id" class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold text-white">
            {{ initials(member.display_name || member.email) }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {{ member.display_name || 'Sans nom' }}
              <span v-if="member.user_id === auth.user.value?.id" class="text-xs font-normal text-slate-400">(vous)</span>
            </p>
            <p class="truncate text-xs text-slate-400">{{ member.email }}</p>
          </div>

          <template v-if="workspace.isOwner.value && member.role !== 'owner'">
            <select
              :value="member.role"
              class="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              @change="changeRole(member.user_id, $event)"
            >
              <option v-for="option in WORKSPACE_ROLES.filter((item) => item.value !== 'owner')" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <button type="button" title="Retirer" class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" @click="toRemove = member.user_id">
              <Trash2 class="size-4" />
            </button>
          </template>
          <UiBadge v-else :label="metaOf(WORKSPACE_ROLES, member.role)?.label" :class="metaOf(WORKSPACE_ROLES, member.role)?.class" />
        </div>
      </div>
    </UiCard>

    <UiCard v-if="workspace.isOwner.value">
      <div class="mb-5">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Invitations en attente</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Partagez le lien avec la personne concernée.</p>
      </div>

      <div v-if="team.invitations.value.length" class="space-y-2">
        <div v-for="invitation in team.invitations.value" :key="invitation.id" class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Mail class="size-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ invitation.email }}</p>
            <p class="text-xs text-slate-400">{{ metaOf(INVITE_ROLES, invitation.role)?.label }} · envoyée le {{ formatDate(invitation.created_at) }}</p>
          </div>
          <UiButton variant="outline" size="sm" @click="copyLink(team.invitationLink(invitation.token))"><Copy class="size-3.5" />Copier le lien</UiButton>
          <button type="button" title="Annuler" class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" @click="team.cancelInvitation(invitation.id)">
            <Trash2 class="size-4" />
          </button>
        </div>
      </div>
      <p v-else class="text-sm text-slate-400">Aucune invitation en attente.</p>

      <div v-if="lastLink" class="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
        <p class="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400"><Link2 class="size-3.5" />Dernier lien généré</p>
        <p class="break-all text-xs text-brand-600 dark:text-brand-400">{{ lastLink }}</p>
      </div>
    </UiCard>

    <UiModal :open="inviteOpen" title="Inviter une personne" description="Choisissez son niveau d’accès à votre espace." size="sm" @close="inviteOpen = false">
      <form class="space-y-4" @submit.prevent="submitInvite">
        <UiInput v-model="inviteEmail" label="Adresse email" type="email" placeholder="personne@exemple.fr" required />
        <UiSelect v-model="inviteRole" label="Droits accordés" :options="INVITE_ROLES" />
        <p class="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          Un lien d’invitation sera généré : partagez-le avec la personne. Elle pourra le modifier plus tard depuis cette page.
        </p>
        <div class="flex justify-end gap-2 pt-2">
          <UiButton variant="ghost" type="button" @click="inviteOpen = false">Annuler</UiButton>
          <UiButton type="submit" :loading="inviting" :disabled="!inviteEmail.trim()"><UserRoundPlus class="size-4" />Inviter</UiButton>
        </div>
      </form>
    </UiModal>

    <UiConfirmModal
      :open="Boolean(toRemove)"
      title="Retirer ce membre ?"
      message="La personne perdra l’accès à cet espace et à toutes ses données."
      confirm-label="Retirer"
      @cancel="toRemove = null"
      @confirm="confirmRemove"
    />
  </div>
</template>
