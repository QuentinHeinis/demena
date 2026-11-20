<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ArrowLeft, Mail } from '@lucide/vue'
import UiCard from '~/components/ui/Card.vue'
import UiInput from '~/components/ui/Input.vue'
import UiButton from '~/components/ui/Button.vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'auth' })

const auth = useAuth()
const form = reactive({ email: '' })
const sent = ref(false)

async function submit() {
  const result = await auth.requestPasswordReset(form.email)
  if (result.success) sent.value = true
}
</script>

<template>
  <UiCard class="shadow-xl shadow-slate-200/60 dark:shadow-none">
    <template v-if="sent">
      <div class="text-center">
        <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Mail class="size-6" />
        </div>
        <h1 class="text-xl font-extrabold text-slate-900 dark:text-white">Email envoyé</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Suivez le lien reçu à {{ form.email }} pour choisir un nouveau mot de passe.</p>
        <NuxtLink to="/login" class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
          <ArrowLeft class="size-4" />Retour à la connexion
        </NuxtLink>
      </div>
    </template>

    <template v-else>
      <div class="mb-6">
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Mot de passe oublié</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Nous vous enverrons un lien pour le réinitialiser.</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <UiInput v-model="form.email" label="Adresse email" type="email" placeholder="vous@exemple.fr" :icon="Mail" required />
        <UiButton type="submit" block size="lg" :loading="auth.pending.value" :disabled="!form.email">Envoyer le lien</UiButton>
      </form>

      <NuxtLink to="/login" class="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
        <ArrowLeft class="size-4" />Retour à la connexion
      </NuxtLink>
    </template>
  </UiCard>
</template>
