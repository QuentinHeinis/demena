<script setup lang="ts">
import { Download, Share, Smartphone } from '@lucide/vue'
import UiButton from '~/components/ui/Button.vue'
import UiModal from '~/components/ui/Modal.vue'
import { usePwaInstall } from '~/composables/usePwaInstall'

const auth = useAuth()
const pwa = usePwaInstall()
const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function show() {
  if (!import.meta.client || !pwa.shouldShow.value || visible.value || timer) return
  timer = setTimeout(() => {
    visible.value = true
    timer = undefined
  }, 1200)
}

function close(dismiss = true) {
  visible.value = false
  if (dismiss) pwa.dismiss()
  if (timer) {
    clearTimeout(timer)
    timer = undefined
  }
}

async function install() {
  const accepted = await pwa.install()
  close(!accepted)
}

watch(() => auth.user.value, (user) => {
  if (user) show()
}, { immediate: true })

watch(() => pwa.shouldShow.value, (canShow) => {
  if (canShow) show()
  else close(false)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <UiModal
    :open="visible"
    title="Installer Déména"
    description="Gardez votre déménagement à portée de main, même hors ligne."
    size="sm"
    @close="close()"
  >
    <div class="flex items-start gap-3 rounded-xl bg-brand-50 p-4 dark:bg-brand-500/10">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
        <Smartphone class="size-5" />
      </div>
      <div>
        <p class="text-sm font-bold text-slate-900 dark:text-white">Une appli, sans magasin</p>
        <p class="mt-1 text-xs leading-snug text-slate-500 dark:text-slate-400">
          L’installation ajoute une icône à votre écran d’accueil et garde vos listes accessibles hors connexion.
        </p>
      </div>
    </div>

    <div v-if="pwa.isIos.value" class="mt-4 space-y-3">
      <div class="flex items-start gap-3">
        <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">1</span>
        <p class="text-sm leading-snug text-slate-700 dark:text-slate-300">
          Ouvrez cette page dans <strong class="font-semibold">Safari</strong>, puis touchez le bouton Partager.
        </p>
      </div>
      <div class="flex items-start gap-3">
        <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">2</span>
        <p class="text-sm leading-snug text-slate-700 dark:text-slate-300">
          Choisissez <strong class="font-semibold">Sur l’écran d’accueil</strong>, puis validez.
        </p>
      </div>
      <p class="flex items-center gap-2 pt-1 text-xs text-slate-400">
        <Share class="size-3.5" /> Le bouton Partager est la flèche vers le haut.
      </p>
    </div>

    <p v-else class="mt-4 text-sm leading-snug text-slate-600 dark:text-slate-300">
      Touchez « Installer » pour ajouter Déména à votre écran d’accueil. Vous pourrez toujours la supprimer ensuite.
    </p>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <UiButton variant="outline" @click="close()">Plus tard</UiButton>
        <UiButton v-if="!pwa.isIos.value && pwa.prompt.value" @click="install()">
          <Download class="size-4" />Installer
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
