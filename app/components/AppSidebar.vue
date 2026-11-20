<script setup lang="ts">
import { X } from '@lucide/vue'
import AppSidebarContent from '~/components/AppSidebarContent.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div>
    <Transition name="drawer">
      <div v-if="props.open" class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" @click="emit('close')" />
        <aside class="absolute inset-y-0 left-0 w-[17rem] shadow-2xl">
          <button
            type="button"
            class="absolute right-3 top-[1.15rem] z-10 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            @click="emit('close')"
          >
            <X class="size-5" />
          </button>
          <AppSidebarContent @navigate="emit('close')" />
        </aside>
      </div>
    </Transition>

    <aside class="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200/80 dark:border-slate-800 lg:block">
      <AppSidebarContent />
    </aside>
  </div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-active aside,
.drawer-leave-active aside {
  transition: transform 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from aside,
.drawer-leave-to aside {
  transform: translateX(-100%);
}
</style>
