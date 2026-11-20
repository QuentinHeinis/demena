<script setup lang="ts">
const theme = useTheme()

onMounted(() => theme.init())
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToastHost />
</template>
