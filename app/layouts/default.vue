<template>
  <div class="flex flex-col min-h-screen bg-background text-foreground">
    <header class="border-b bg-card/95 backdrop-blur">
      <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm text-muted-foreground">Florist Studio</p>
          <h4 class="text-2xl font-semibold tracking-tight">Back-office MVP</h4>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            @click="toggleTheme"
            aria-label="Переключить тему"
            class="relative h-8 w-[64px] rounded-2xl border border-border bg-accent outline-none cursor-pointer"
          >
            <span
              class="absolute left-1 top-1 h-6 w-6 rounded-full bg-background shadow-sm ring-1 ring-border transition-transform duration-300 ease-out"
              :class="isDark ? 'translate-x-[30px]' : 'translate-x-0'"
            />
            <span class="absolute left-1 top-1 z-10 flex h-6 w-6 items-center justify-center">
              <QIcon
                name="light_mode"
                size="15px"
                class="transition-colors duration-300"
                :class="isDark ? 'text-muted-foreground/45' : 'text-amber-500'"
              />
            </span>
            <span class="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center">
              <QIcon
                name="dark_mode"
                size="15px"
                class="transition-colors duration-300"
                :class="isDark ? 'text-slate-300' : 'text-muted-foreground/45'"
              />
            </span>
          </button>
          <NuxtLink
            to="/"
            class="rounded-2xl px-4 py-2 text-sm font-medium transition-colors"
            :class="route.path === '/' ? 'bg-(--q-primary) text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'"
          >
            Калькулятор
          </NuxtLink>
          <NuxtLink
            to="/history"
            class="rounded-2xl px-4 py-2 text-sm font-medium transition-colors"
          :class="route.path === '/history' ? 'bg-(--q-primary) text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'"
          >
            История
          </NuxtLink>
          <p v-if="currentUser" class="ml-2 text-sm font-medium text-foreground">
            {{ currentUser.displayName }}
          </p>
        </div>
      </div>
    </header>

    <main class="mx-auto flex-1 max-w-6xl px-4 py-8">
      <slot />
    </main>
    <footer class="text-center text-sm text-muted-foreground">developed by r33n</footer>
  </div>
</template>

<script setup lang="ts">
import { Dark, QIcon } from 'quasar'

const { currentUser } = useBouquetCalculator()
const route = useRoute()
const theme = useCookie<'light' | 'dark'>('florist-theme', {
  default: () => 'light',
  sameSite: 'lax',
})

const isDark = computed(() => theme.value === 'dark')

useHead(() => ({
  bodyAttrs: {
    class: isDark.value ? 'body--dark' : 'body--light',
  },
}))

const applyTheme = () => {
  if (import.meta.client) {
    Dark.set(isDark.value)
  }
}

const toggleTheme = () => {
  theme.value = isDark.value ? 'light' : 'dark'
  applyTheme()
}

if (import.meta.client) {
  applyTheme()
}

watch(theme, () => {
  applyTheme()
})
</script>
