<script setup lang="ts">
import { reactive } from 'vue'
import { ArrowRight, LockKeyhole, Mail } from '@lucide/vue'
import UiCard from '~/components/ui/Card.vue'
import UiInput from '~/components/ui/Input.vue'
import UiButton from '~/components/ui/Button.vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'auth' })

const auth = useAuth()
const route = useRoute()
const form = reactive({ email: '', password: '' })

async function submit() {
  const result = await auth.signIn(form.email, form.password)
  if (result.success) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await navigateTo(redirect)
  }
}
</script>

<template>
  <UiCard class="shadow-xl shadow-slate-200/60 dark:shadow-none">
    <div class="mb-6">
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Bon retour</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Connectez-vous pour retrouver votre espace de déménagement.</p>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <UiInput v-model="form.email" label="Adresse email" type="email" placeholder="vous@exemple.fr" :icon="Mail" required />
      <UiInput v-model="form.password" label="Mot de passe" type="password" placeholder="••••••••" :icon="LockKeyhole" required />

      <div class="flex justify-end">
        <NuxtLink to="/forgot-password" class="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">Mot de passe oublié ?</NuxtLink>
      </div>

      <UiButton type="submit" block size="lg" :loading="auth.pending.value" :disabled="!form.email || !form.password">
        Se connecter <ArrowRight class="size-4" />
      </UiButton>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
      Pas encore de compte ?
      <NuxtLink to="/register" class="font-semibold text-brand-600 hover:underline dark:text-brand-400">Créer un espace</NuxtLink>
    </p>
  </UiCard>
</template>
