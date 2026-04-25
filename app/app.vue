<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  link: [
    {
      rel: 'manifest',
      href: '/manifest.webmanifest',
    },
  ],
  meta: [
    {
      name: 'theme-color',
      content: '#00897b',
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'Florist Studio',
    },
  ],
})
</script>
