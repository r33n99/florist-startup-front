export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-quasar-ui'],
  css: ['~/assets/css/main.css'],
  quasar: {
    plugins: ['Dark'],
    extras: {
      fontIcons: ['material-icons'],
    },
    config: {
      brand: {
        primary: '#00897b',
        secondary: '#546e7a',
        accent: '#00897b',
        positive: '#2e7d32',
        negative: '#c62828',
        info: '#0288d1',
        warning: '#ed6c02',
      },
    },
  },
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3101',
    },
  },
})
