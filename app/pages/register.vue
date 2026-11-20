<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ArrowRight, LockKeyhole, Mail, UserRound } from '@lucide/vue'
import UiCard from '~/components/ui/Card.vue'
import UiInput from '~/components/ui/Input.vue'
import UiButton from '~/components/ui/Button.vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'auth' })

const auth = useAuth()
const form = reactive({ displayName: '', email: '', password: '' })
const needsConfirmation = ref(false)

async function submit() {
  const result = await auth.signUp(form.email, form.password, form.displayName)
  if (!result.success) return
  if (result.needsConfirmation) {
    needsConfirmation.value = true
    return
  }
  await navigateTo('/')
}
</script>

<template>
  <UiCard class="shadow-xl shadow-slate-200/60 dark:shadow-none">
    <template v-if="needsConfirmation">
      <div class="text-center">
        <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <Mail class="size-6" />
        </div>
        <h1 class="text-xl font-extrabold text-slate-900 dark:text-white">Vérifiez votre boîte mail</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Un lien de confirmation a été envoyé à <strong class="text-slate-700 dark:text-slate-200">{{ form.email }}</strong>. Cliquez dessus pour activer votre espace.</p>
        <NuxtLink to="/login" class="mt-6 inline-block text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">Retour à la connexion</NuxtLink>
      </div>
    </template>

    <template v-else>
      <div class="mb-6">
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Créez votre espace</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Tâches, budget, appartements : tout votre déménagement au même endroit.</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <UiInput v-model="form.displayName" label="Votre nom" placeholder="Camille Dupont" :icon="UserRound" />
        <UiInput v-model="form.email" label="Adresse email" type="email" placeholder="vous@exemple.fr" :icon="Mail" required />
        <UiInput v-model="form.password" label="Mot de passe" type="password" placeholder="8 caractères minimum" :icon="LockKeyhole" min="8" required hint="Utilisez au moins 8 caractères." />
        <UiButton type="submit" block size="lg" :loading="auth.pending.value" :disabled="!form.email || form.password.length < 8">
          Créer mon espace <ArrowRight class="size-4" />
        </UiButton>
      </form>

      <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Déjà un compte ?
        <NuxtLink to="/login" class="font-semibold text-brand-600 hover:underline dark:text-brand-400">Se connecter</NuxtLink>
      </p>
    </template>
  </UiCard>
</template>
