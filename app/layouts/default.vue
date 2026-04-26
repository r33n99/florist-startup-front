<template>
  <div class="flex flex-col min-h-screen bg-background text-foreground">
    <header class="border-b bg-card/95 backdrop-blur">
      <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm text-muted-foreground">Florist Studio</p>
          <h5 class="text-2xl font-semibold tracking-tight">Приложение для флористов</h5>
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
              <i
                class="pi pi-sun text-[13px] transition-colors duration-300"
                :class="!isDark && 'text-amber-500'"
              />
            </span>
            <span class="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center">
              <i
                class="pi pi-moon text-[13px] transition-colors duration-300"
                :class="!isDark && 'text-slate-300'"
              />
            </span>
          </button>
          <NuxtLink
            to="/"
            class="rounded-2xl px-4 py-2 text-sm font-medium transition-colors"
            :class="route.path === '/' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'"
          >
            Калькулятор
          </NuxtLink>
          <NuxtLink
            to="/history"
            class="rounded-2xl px-4 py-2 text-sm font-medium transition-colors"
          :class="route.path.startsWith('/history') ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'"
          >
            История
          </NuxtLink>
          <NuxtLink
            v-if="currentUser?.role === 'admin'"
            to="/products"
            class="rounded-2xl px-4 py-2 text-sm font-medium transition-colors"
            :class="route.path.startsWith('/products') ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'"
          >
            Товары
          </NuxtLink>
          <Button
            v-if="showInstallButton"
            size="small"
            label="Установить приложение"
            icon="pi pi-download"
            @click="handleInstallApp"
          />
          <div v-if="currentUser" class="flex items-center md:px-3 text-sm font-medium leading-none text-foreground">
            {{ currentUser.displayName }}
          </div>
        </div>
      </div>
      <div v-if="showIosInstallHint" class="mx-auto max-w-6xl px-4 pb-4">
        <Message severity="info">
          На iPhone: нажми «Поделиться» в Safari → «На экран Домой».
        </Message>
      </div>
    </header>

    <main class="mx-auto flex-1 max-w-6xl px-4 py-8">
      <div v-if="loading" class="flex min-h-[50vh] items-center justify-center">
        <AppLoader />
      </div>
      <slot v-else />
    </main>
    <footer class="text-center text-sm text-muted-foreground">developed by <a href="https://t.me/r33n_dev" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">r33n</a></footer>
  </div>
</template>

<script setup lang="ts">
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const { currentUser } = useBouquetCalculator()
const route = useRoute()
const theme = useCookie<'light' | 'dark'>('florist-theme', {
  default: () => 'light',
  sameSite: 'lax',
})

const isDark = computed(() => theme.value === 'dark')

useHead(() => ({
  htmlAttrs: {
    class: isDark.value ? 'dark' : '',
  },
}))

const toggleTheme = () => {
  theme.value = isDark.value ? 'light' : 'dark'
}

const hasShowLoading = useState('hasShowLoading', () => false)
const loading = ref(!hasShowLoading.value)
const deferredInstallPrompt = ref<BeforeInstallPromptEvent | null>(null)
const canInstallPrompt = ref(false)
const showIosInstallHint = ref(false)
const isIosDevice = ref(false)
const isStandaloneMode = ref(false)

const showInstallButton = computed(() => {
  if (!currentUser.value || isStandaloneMode.value) {
    return false
  }
  return canInstallPrompt.value || isIosDevice.value
})

const showInitialLoader = async () => {
  if (hasShowLoading.value) {
    loading.value = false
    return
  }
  
  setTimeout(() => {
    loading.value = false
    hasShowLoading.value = true
  }, 1000)
}

const detectStandaloneMode = () => {
  if (!import.meta.client) {
    return false
  }

  const navigatorStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone
  return window.matchMedia('(display-mode: standalone)').matches || navigatorStandalone === true
}

const handleInstallApp = async () => {
  showIosInstallHint.value = false

  if (isIosDevice.value) {
    showIosInstallHint.value = true
    return
  }

  if (!deferredInstallPrompt.value) {
    return
  }

  await deferredInstallPrompt.value.prompt()
  const choice = await deferredInstallPrompt.value.userChoice
  if (choice.outcome === 'accepted') {
    deferredInstallPrompt.value = null
    canInstallPrompt.value = false
  }
}

const onBeforeInstallPrompt = (event: Event) => {
  event.preventDefault()
  deferredInstallPrompt.value = event as BeforeInstallPromptEvent
  canInstallPrompt.value = true
}

const onAppInstalled = () => {
  deferredInstallPrompt.value = null
  canInstallPrompt.value = false
  isStandaloneMode.value = true
  showIosInstallHint.value = false
}

onMounted(() => {
  isIosDevice.value = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
  isStandaloneMode.value = detectStandaloneMode()
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.addEventListener('appinstalled', onAppInstalled)
  showInitialLoader()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.removeEventListener('appinstalled', onAppInstalled)
})
</script>
