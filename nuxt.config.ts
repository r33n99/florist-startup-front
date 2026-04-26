import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'

const FloristPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e0f2f1',
      100: '#b2dfdb',
      200: '#80cbc4',
      300: '#4db6ac',
      400: '#26a69a',
      500: '#00897b',
      600: '#00796b',
      700: '#00695c',
      800: '#00574f',
      900: '#004d40',
      950: '#00352d',
    },
    textColor: {
      50: '#f5f5f5',
      100: '#e0e0e0',
      200: '#c2c2c2',
      300: '#a3a3a3',
      400: '#858585',
      500: '#666666',
    },
  },
})

const defaultApiBase = 'http://localhost:3101'
const apiBase = (process.env.NUXT_PUBLIC_API_BASE || defaultApiBase).replace(/\/+$/, '')
const escapedApiBase = apiBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@primevue/nuxt-module', '@vite-pwa/nuxt'],
  css: ['primeicons/primeicons.css', '~/assets/css/main.css'],
  primevue: {
    options: {
      ripple: true,
      inputVariant: 'outlined',
      theme: {
        preset: FloristPreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark',
          cssLayer: false,
        },
      },
    },
    components: {
      include: [
        'Accordion',
        'AccordionContent',
        'AccordionHeader',
        'AccordionPanel',
        'Avatar',
        'Button',
        'Card',
        'Divider',
        'Fieldset',
        'FloatLabel',
        'Image',
        'InputNumber',
        'InputText',
        'Message',
        'ProgressSpinner',
        'Select',
        'ToggleSwitch',
      ],
    },
  },
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },
  runtimeConfig: {
    public: {
      apiBase,
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Florist Studio Back-office',
      short_name: 'Florist Studio',
      description: 'CRM для флористики: расчет заказов и история.',
      lang: 'ru',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: '#00897b',
      background_color: '#121212',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/icons/icon-192-maskable.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/icons/icon-512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      runtimeCaching: [
        {
          urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|svg|webp|gif|ico)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-assets',
          },
        },
        {
          urlPattern: new RegExp(`^${escapedApiBase}\\/.*$`, 'i'),
          handler: 'NetworkOnly',
        },
      ],
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
    },
  },
})
