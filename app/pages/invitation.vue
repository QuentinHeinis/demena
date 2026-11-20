<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, CheckCircle2, LogIn, TriangleAlert } from '@lucide/vue'
import UiCard from '~/components/ui/Card.vue'
import UiButton from '~/components/ui/Button.vue'
import { useAuth } from '~/composables/useAuth'
import { useTeam } from '~/composables/useTeam'
import { useWorkspace } from '~/composables/useWorkspace'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const auth = useAuth()
const team = useTeam()
const workspace = useWorkspace()

const status = ref<'loading' | 'login' | 'success' | 'error'>('loading')
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const loginLink = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`)

onMounted(async () => {
  await auth.initialize()
  if (!auth.user.value) {
    status.value = 'login'
    return
  }
  if (!token.value) {
    status.value = 'error'
    return
  }

  const accepted = await team.accept(token.value)
  status.value = accepted ? 'success' : 'error'
})
</script>

<template>
  <UiCard class="text-center shadow-xl shadow-slate-200/60 dark:shadow-none">
    <template v-if="status === 'loading'">
      <div class="flex flex-col items-center gap-3 py-8">
        <div class="size-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600 dark:border-brand-900 dark:border-t-brand-400" />
        <p class="text-sm text-slate-500 dark:text-slate-400">Acceptation de l’invitation…</p>
      </div>
    </template>

    <template v-else-if="status === 'login'">
      <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
        <LogIn class="size-6" />
      </div>
      <h1 class="text-xl font-extrabold text-slate-900 dark:text-white">Connectez-vous pour continuer</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Cette invitation est liée à votre compte. Connectez-vous, vous serez ajouté automatiquement à l’espace partagé.</p>
      <NuxtLink :to="loginLink" class="mt-6 block">
        <UiButton block size="lg">Se connecter <ArrowRight class="size-4" /></UiButton>
      </NuxtLink>
      <NuxtLink to="/register" class="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">Créer un compte</NuxtLink>
    </template>

    <template v-else-if="status === 'success'">
      <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
        <CheckCircle2 class="size-6" />
      </div>
      <h1 class="text-xl font-extrabold text-slate-900 dark:text-white">Invitation acceptée</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Vous faites maintenant partie de « {{ workspace.workspace.value?.name }} ».</p>
      <NuxtLink to="/" class="mt-6 block">
        <UiButton block size="lg">Ouvrir l’espace <ArrowRight class="size-4" /></UiButton>
      </NuxtLink>
    </template>

    <template v-else>
      <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
        <TriangleAlert class="size-6" />
      </div>
      <h1 class="text-xl font-extrabold text-slate-900 dark:text-white">Invitation invalide</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Le lien est expiré, déjà utilisé, ou ne correspond pas à l’adresse email connectée.</p>
      <NuxtLink to="/" class="mt-6 block"><UiButton block variant="outline">Retour à l’accueil</UiButton></NuxtLink>
    </template>
  </UiCard>
</template>
