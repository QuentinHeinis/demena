<script setup lang="ts">
const theme = useTheme()
const reminders = useReminders()

onMounted(() => {
  theme.init()
  reminders.init()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToastHost />
</template>
