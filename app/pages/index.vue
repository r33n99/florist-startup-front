<template>
  <div
    class="gap-6"
    :class="hasSidebar ? 'grid lg:grid-cols-[2fr_1fr]' : 'mx-auto max-w-3xl'"
  >
    <QCard v-if="!currentUser" :dark="isDark" flat bordered class="bg-card text-foreground">
      <QCardSection>
        <div class="grid gap-4 md:grid-cols-3">
          <QInput :dark="isDark" v-model="loginForm.username" outlined label="Логин" placeholder="owner" />
          <QInput :dark="isDark" v-model="loginForm.password" outlined type="password" label="Пароль" placeholder="owner123" />
          <div class="flex items-end">
            <QBtn :dark="isDark" class="w-full rounded-2xl" unelevated no-caps color="primary" label="Войти" @click="handleLogin" />
          </div>
        </div>

        <QBanner :dark="isDark" v-if="authError" dense inline-actions rounded class="mt-4 bg-red-1 text-negative">
          {{ authError }}
        </QBanner>

        <p class="mt-4 text-xs text-muted-foreground">
          Тестовые аккаунты: `owner / owner123`, `florist / florist123`
        </p>
      </QCardSection>
    </QCard>

    <div v-else class="space-y-6">
      <div v-if="!bouquetEnabled && !miscEnabled" class="space-y-4 text-center">
        <h4 class="text-2xl font-semibold tracking-tight">Начать процесс оформления заказа</h4>
        <p class="text-sm text-muted-foreground">
          Выбери, что добавить в заказ первым.
        </p>
      </div>

      <div class="flex items-center justify-center gap-3">
        <button
          type="button"
          class="min-w-[180px] rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer"
          :class="bouquetEnabled ? 'border-transparent bg-(--q-primary) text-white shadow-sm' : 'border-border bg-background text-foreground hover:border-(--q-primary) hover:text-foreground'"
          @click="toggleBouquet"
        >
          Букет
        </button>
        <button
          type="button"
          class="min-w-[180px] rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer"
          :class="miscEnabled ? 'border-transparent bg-(--q-primary) text-white shadow-sm' : 'border-border bg-background text-foreground hover:border-(--q-primary) hover:text-foreground'"
          @click="toggleMisc"
        >
          Разные товары
        </button>
      </div>

      <section v-if="bouquetEnabled" class="rounded-2xl border border-border/70 bg-background/60 p-4 md:p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 class="font-semibold">Состав букета</h4>
            <p class="text-sm text-muted-foreground">
              Каталог цветов загружается отдельно, QR формируется только для букета.
            </p>
          </div>
          <QBtn class="rounded-2xl!" :dark="isDark" outline no-caps color="positive" label="+ Добавить цветок" @click="addBouquetLine" />
        </div>

        <div class="mt-4 space-y-3">
          <div
            v-for="line in bouquetLines"
            :key="line.id"
            class="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]"
          >
            <QSelect
              :dark="isDark"
              v-model="line.itemId"
              outlined
              emit-value
              map-options
              label="Цветок"
              :options="flowerOptions"
            />
            <QInput :dark="isDark" v-model.number="line.count" outlined type="number" min="1" label="Количество" />
            <div class="flex items-center">
              <QBtn class="rounded-full!" :dark="isDark" flat no-caps color="negative" label="Удалить" @click="removeBouquetLine(line.id)" />
            </div>
          </div>
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-3">
          <QInput :dark="isDark" v-model.number="markupPercent" outlined type="text" label="Наценка (%)" />
          <QInput :dark="isDark" v-model.number="packagingCost" outlined type="text" label="Упаковка (KGS)" />
          <QInput :dark="isDark" v-model.number="laborCost" outlined type="text"label="Работа флориста (KGS)" />
        </div>
      </section>

      <section v-if="miscEnabled" class="rounded-2xl border border-border/70 bg-background/60 p-4 md:p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 class="font-semibold">Разные товары</h4>
            <p class="text-sm text-muted-foreground">
              Дополнительные позиции к заказу без QR.
            </p>
          </div>
          <QBtn class="rounded-2xl!" :dark="isDark" outline no-caps color="positive" label="+ Добавить товар" @click="addMiscLine" />
        </div>

        <div class="mt-4 space-y-3">
          <div
            v-for="line in miscLines"
            :key="line.id"
            class="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]"
          >
            <QSelect
              :dark="isDark"
              v-model="line.itemId"
              outlined
              emit-value
              map-options
              label="Товар"
              :options="miscProductOptions"
            />
            <QInput :dark="isDark" v-model.number="line.count" outlined type="number" min="1" label="Количество" />
            <div class="flex items-center">
              <QBtn class="rounded-full!" :dark="isDark" flat no-caps color="negative" label="Удалить" @click="removeMiscLine(line.id)" />
            </div>
          </div>
        </div>
      </section>

      <div class="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
        <QBtn
          :dark="isDark"
          v-if="miscEnabled || bouquetEnabled"
          unelevated
          no-caps
          color="primary"
          class="rounded-2xl"
          label="Оформить заказ"
          @click="submitOrder"
        />
      </div>

      <QBanner :dark="isDark" v-if="requestError" dense inline-actions rounded class="mt-4 bg-red-1 text-negative">
        {{ requestError }}
      </QBanner>
    </div>

    <aside v-if="hasSidebar" class="space-y-4">
      <QCard :dark="isDark" v-if="result" flat bordered class="bg-transparent rounded-2xl! text-foreground border-border/70!">
        <QCardSection class="space-y-3">
          <h4 class="text-2xl font-semibold leading-tight">Итог расчёта</h4>

          <div class="space-y-2 text-sm">
            <div v-if="bouquetEnabled" class="flex items-center justify-between gap-3">
              <span class="text-muted-foreground">Букет</span>
              <strong>{{ result?.bouquet?.total ?? 0 }} KGS</strong>
            </div>
            <div class="flex items-center justify-between gap-3">
              <span class="text-muted-foreground">Разные товары</span>
              <strong>{{ result?.misc?.subtotal ?? 0 }} KGS</strong>
            </div>
            <div class="flex items-center justify-between gap-3 text-base">
              <span class="font-medium">Итог</span>
              <strong>{{ result?.grandTotal ?? 0 }} KGS</strong>
            </div>
          </div>
        </QCardSection>
      </QCard>

      <QCard :dark="isDark" v-if="savedBouquet" flat bordered class="bg-transparent rounded-2xl! text-foreground border-border/70!">
        <QCardSection class="space-y-3">
          <h4 class="text-2xl font-semibold leading-tight">Букет сохранён</h4>
          <p class="text-sm text-muted-foreground">{{ formatDate(savedBouquet.createdAt) }}</p>
          <p class="text-sm">Цена: {{ savedBouquet.total }} KGS</p>
          <div class="flex flex-col! items-center md:flex-nowrap! md:items-end gap-4">
            <img :src="savedBouquet.qrDataUrl" alt="QR code" class="h-40 w-40 rounded-lg border bg-white p-2">
            <QBtn
              :dark="isDark"
              unelevated
              no-caps
              color="primary"
              class="w-full! rounded-2xl!"
              label="Печать"
              @click="printBouquetQr"
            />
          </div>
        </QCardSection>
      </QCard>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { QBanner, QBtn, QCard, QCardSection, QInput, QSelect } from 'quasar'

const theme = useCookie<'light' | 'dark'>('florist-theme', {
  default: () => 'light',
  sameSite: 'lax',
})

const isDark = computed(() => theme.value === 'dark')

type FlowerItem = {
  id: string
  name: string
  unitCost: number
}

type MiscProduct = {
  id: string
  name: string
  unitCost: number
}

type SelectOption = {
  label: string
  value: string
}

type EditableLine = {
  id: string
  itemId: string
  count: number
}

type CalculationBreakdown = {
  itemId: string
  itemName: string
  itemType: 'flower' | 'misc'
  count: number
  unitCost: number
  lineTotal: number
}

type MixedResult = {
  bouquet: {
    subtotal: number
    total: number
    breakdown: CalculationBreakdown[]
  } | null
  misc: {
    subtotal: number
    breakdown: CalculationBreakdown[]
  }
  grandTotal: number
}

type SavedBouquet = {
  id: string
  name: string
  createdAt: string
  total: number
  qrDataUrl: string
}

type PersistedCalculatorState = {
  bouquetEnabled: boolean
  miscEnabled: boolean
  bouquetLines: EditableLine[]
  miscLines: EditableLine[]
  markupPercent: number
  packagingCost: number
  laborCost: number
}

const {
  currentUser,
  loadFlowers,
  loadMiscProducts,
  login,
  logout,
  calculateMixed,
  saveBouquetHistory,
  saveMiscHistory,
} = useBouquetCalculator()

const loginForm = reactive({
  username: 'owner',
  password: 'owner123',
})

const flowers = ref<FlowerItem[]>([])
const miscProducts = ref<MiscProduct[]>([])
const bouquetEnabled = ref(false)
const miscEnabled = ref(false)
const bouquetLines = ref<EditableLine[]>([])
const miscLines = ref<EditableLine[]>([])
const markupPercent = ref(150)
const packagingCost = ref(90)
const laborCost = ref(120)
const result = ref<MixedResult | null>(null)
const savedBouquet = ref<SavedBouquet | null>(null)
const requestError = ref('')
const authError = ref('')
const hasSidebar = computed(() => Boolean(result.value || savedBouquet.value))
const calculatorStorageKey = 'florist-calculator-state'

const flowerOptions = computed<SelectOption[]>(() =>
  flowers.value.map((flower) => ({
    label: `${flower.name} (${flower.unitCost} KGS)`,
    value: flower.id,
  })),
)

const miscProductOptions = computed<SelectOption[]>(() =>
  miscProducts.value.map((product) => ({
    label: `${product.name} (${product.unitCost} KGS)`,
    value: product.id,
  })),
)

const createLine = (itemId = ''): EditableLine => ({
  id: crypto.randomUUID(),
  itemId,
  count: 1,
})

const sanitizeLines = (value: unknown): EditableLine[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((line) => {
    const entry = typeof line === 'object' && line ? line as Partial<EditableLine> : {}
    return {
      id: typeof entry.id === 'string' && entry.id.length > 0 ? entry.id : crypto.randomUUID(),
      itemId: typeof entry.itemId === 'string' ? entry.itemId : '',
      count: typeof entry.count === 'number' && Number.isFinite(entry.count) ? entry.count : 1,
    }
  })
}

const saveCalculatorState = () => {
  if (!import.meta.client) {
    return
  }

  const snapshot: PersistedCalculatorState = {
    bouquetEnabled: bouquetEnabled.value,
    miscEnabled: miscEnabled.value,
    bouquetLines: bouquetLines.value,
    miscLines: miscLines.value,
    markupPercent: markupPercent.value,
    packagingCost: packagingCost.value,
    laborCost: laborCost.value,
  }

  localStorage.setItem(calculatorStorageKey, JSON.stringify(snapshot))
}

const restoreCalculatorState = async () => {
  if (!import.meta.client) {
    return
  }

  const raw = localStorage.getItem(calculatorStorageKey)
  if (!raw) {
    return
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedCalculatorState>
    bouquetEnabled.value = Boolean(parsed.bouquetEnabled)
    miscEnabled.value = Boolean(parsed.miscEnabled)
    bouquetLines.value = sanitizeLines(parsed.bouquetLines)
    miscLines.value = sanitizeLines(parsed.miscLines)
    markupPercent.value = typeof parsed.markupPercent === 'number' ? parsed.markupPercent : 150
    packagingCost.value = typeof parsed.packagingCost === 'number' ? parsed.packagingCost : 90
    laborCost.value = typeof parsed.laborCost === 'number' ? parsed.laborCost : 120

    if (bouquetEnabled.value) {
      flowers.value = await loadFlowers()
      if (bouquetLines.value.length === 0) {
        bouquetLines.value = [createLine(flowers.value[0]?.id ?? '')]
      }
    }

    if (miscEnabled.value) {
      miscProducts.value = await loadMiscProducts()
      if (miscLines.value.length === 0) {
        miscLines.value = [createLine(miscProducts.value[0]?.id ?? '')]
      }
    }
  } catch {
    localStorage.removeItem(calculatorStorageKey)
  }
}

const addBouquetLine = () => {
  bouquetLines.value.push(createLine(flowers.value[0]?.id ?? ''))
}

const addMiscLine = () => {
  miscLines.value.push(createLine(miscProducts.value[0]?.id ?? ''))
}

const removeBouquetLine = (lineId: string) => {
  bouquetLines.value = bouquetLines.value.filter((line) => line.id !== lineId)
}

const removeMiscLine = (lineId: string) => {
  miscLines.value = miscLines.value.filter((line) => line.id !== lineId)
}

const buildBouquetPayload = () => {
  const lines = bouquetLines.value
    .filter((line) => line.itemId)
    .map((line) => ({
      itemId: line.itemId,
      count: Number(line.count || 0),
    }))

  if (lines.length === 0) {
    return null
  }

  return {
    lines,
    markupPercent: Number(markupPercent.value || 0),
    packagingCost: Number(packagingCost.value || 0),
    laborCost: Number(laborCost.value || 0),
  }
}

const buildMiscLines = () => {
  return miscLines.value
    .filter((line) => line.itemId)
    .map((line) => ({
      itemId: line.itemId,
      count: Number(line.count || 0),
    }))
}

const submitOrder = async () => {
  requestError.value = ''

  const bouquet = bouquetEnabled.value ? buildBouquetPayload() : null
  const misc = miscEnabled.value ? buildMiscLines() : []

  if (!bouquet && misc.length === 0) {
    requestError.value = 'Добавь хотя бы одну позицию перед оформлением заказа'
    return
  }

  try {
    result.value = await calculateMixed({
      bouquet,
      miscLines: misc,
    })

    const orderGroupId = bouquet && misc.length > 0 ? crypto.randomUUID() : undefined

    if (bouquet) {
      savedBouquet.value = await saveBouquetHistory(bouquet, orderGroupId)
    } else {
      savedBouquet.value = null
    }

    if (misc.length > 0) {
      await saveMiscHistory(misc, orderGroupId)
    }
  } catch (error) {
    requestError.value = error instanceof Error ? error.message : 'Не удалось оформить заказ'
  }
}

const toggleBouquet = async () => {
  bouquetEnabled.value = !bouquetEnabled.value
  if (bouquetEnabled.value && flowers.value.length === 0) {
    flowers.value = await loadFlowers()
    if (bouquetLines.value.length === 0) {
      bouquetLines.value = [createLine(flowers.value[0]?.id ?? '')]
    }
  }
}

const toggleMisc = async () => {
  miscEnabled.value = !miscEnabled.value
  if (miscEnabled.value && miscProducts.value.length === 0) {
    miscProducts.value = await loadMiscProducts()
    if (miscLines.value.length === 0) {
      miscLines.value = [createLine(miscProducts.value[0]?.id ?? '')]
    }
  }
}

const handleLogin = async () => {
  authError.value = ''
  requestError.value = ''
  try {
    await login(loginForm.username, loginForm.password)
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'Не удалось войти'
  }
}

const handleLogout = () => {
  logout()
  bouquetEnabled.value = false
  miscEnabled.value = false
  bouquetLines.value = []
  miscLines.value = []
  result.value = null
  savedBouquet.value = null
}

const printBouquetQr = () => {
  if (!savedBouquet.value || !import.meta.client) {
    return
  }

  const printWindow = window.open('', '_blank', 'width=420,height=640')

  if (!printWindow) {
    return
  }

  const html = `
    <!doctype html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <title>Печать QR</title>
        <style>
          body {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #ffffff;
          }
          img {
            width: 240px;
            height: 240px;
            display: block;
          }
        </style>
      </head>
      <body>
        <img src="${savedBouquet.value.qrDataUrl}" alt="QR code" />
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        <\/script>
      </body>
    </html>
  `

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}

const formatDate = (value: string) => new Date(value).toLocaleString('ru-RU')

onMounted(async () => {
  if (!currentUser.value) {
    return
  }

  await restoreCalculatorState()
})

watch(
  [bouquetEnabled, miscEnabled, bouquetLines, miscLines, markupPercent, packagingCost, laborCost, currentUser],
  () => {
    if (!currentUser.value) {
      return
    }
    saveCalculatorState()
  },
  { deep: true },
)
</script>
