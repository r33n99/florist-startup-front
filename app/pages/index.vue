<template>
  <div
    class="gap-6"
    :class="hasSidebar ? 'grid lg:grid-cols-[2fr_1fr]' : 'mx-auto max-w-3xl'"
  >
    <Card v-if="!currentUser" class="bg-card text-foreground">
      <template #content>
        <div class="grid gap-4 md:grid-cols-3">
          <FloatLabel variant="on">
            <InputText id="login-username" v-model="loginForm.username" class="w-full" />
            <label for="login-username">Логин</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputText id="login-password" v-model="loginForm.password" class="w-full" type="password" />
            <label for="login-password">Пароль</label>
          </FloatLabel>
          <div class="flex items-end">
            <Button class="w-full" label="Войти" @click="handleLogin" />
          </div>
        </div>

        <Message v-if="authError" severity="error" class="mt-4">
          {{ authError }}
        </Message>

        <p class="mt-4 text-xs text-muted-foreground">
          Тестовые аккаунты: `owner / owner123`, `florist / florist123`
        </p>
      </template>
    </Card>

    <div v-else class="space-y-6">
      <div v-if="!bouquetEnabled && !miscEnabled" class="space-y-4 text-center">
        <h4 class="text-2xl font-semibold tracking-tight">Начать процесс оформления заказа</h4>
        <p class="text-sm text-muted-foreground">
          Выбери, что добавить в заказ первым.
        </p>
      </div>

      <div class="flex items-center justify-center gap-3">
        <Button
          unstyled
          type="button"
          class="min-w-[150px] sm:min-w-[180px] rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer"
          :class="bouquetEnabled ? 'border-transparent bg-primary text-white shadow-sm' : 'border-border bg-background text-foreground hover:bg-primary hover:text-white hover:border-transparent'"
          @click="toggleBouquet"
        >
          Букет
        </Button>
        <Button
          unstyled
          type="button"
          class="min-w-[150px] sm:min-w-[180px] rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer"
          :class="miscEnabled ? 'border-transparent bg-primary text-white shadow-sm' : 'border-border bg-background text-foreground hover:bg-primary hover:text-white hover:border-transparent'"
          @click="toggleMisc"
        >
          Разные товары
        </Button>
      </div>

      <Fieldset v-if="bouquetEnabled" class="bg-background/60 mb-5!">
        <template #legend>
          <div class="space-y-1">
            <p class="font-semibold">Состав букета</p>
            <p class="text-sm font-normal text-muted-foreground">Каталог цветов загружается отдельно, QR формируется только для букета.</p>
          </div>
        </template>

        <div class="flex justify-end">
          <Button
            unstyled
            class="rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 cursor-pointer hover:bg-primary hover:text-white hover:border-transparent"
            label="+ Добавить цветок"
            @click="addBouquetLine"
          />
        </div>

        <div class="mt-4 space-y-3">
          <div
            v-for="line in bouquetLines"
            :key="line.id"
            class="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]"
          >
            <FloatLabel variant="on">
              <Select
                :input-id="`bouquet-flower-${line.id}`"
                v-model="line.itemId"
                class="w-full"
                :options="flowerOptions"
                option-label="label"
                option-value="value"
              />
              <label :for="`bouquet-flower-${line.id}`">Цветок</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <InputNumber
                :input-id="`bouquet-count-${line.id}`"
                v-model="line.count"
                class="w-full"
                input-class="w-full"
                :min="1"
              />
              <label :for="`bouquet-count-${line.id}`">Количество</label>
            </FloatLabel>
            <div class="flex items-center">
              <Button
                unstyled
                class="rounded-2xl px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 cursor-pointer hover:bg-red-700 hover:text-white hover:border-transparent"
                label="Удалить"
                @click="removeBouquetLine(line.id)"
              />
            </div>
          </div>
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-3">
          <FloatLabel variant="on">
            <InputNumber
              input-id="bouquet-markup-percent"
              v-model="markupPercent"
              class="w-full"
              input-class="w-full"
              :min="0"
            />
            <label for="bouquet-markup-percent">Наценка (%)</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputNumber
              input-id="bouquet-packaging-cost"
              v-model="packagingCost"
              class="w-full"
              input-class="w-full"
              :min="0"
            />
            <label for="bouquet-packaging-cost">Упаковка (KGS)</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputNumber
              input-id="bouquet-labor-cost"
              v-model="laborCost"
              class="w-full"
              input-class="w-full"
              :min="0"
            />
            <label for="bouquet-labor-cost">Работа флориста (KGS)</label>
          </FloatLabel>
        </div>
      </Fieldset>

      <Fieldset v-if="miscEnabled" class="bg-background/60">
        <template #legend>
          <div class="space-y-1">
            <p class="font-semibold">Разные товары</p>
            <p class="text-sm font-normal text-muted-foreground">Дополнительные позиции к заказу без QR.</p>
          </div>
        </template>

        <div class="flex justify-end">
          <Button
            unstyled
            class="rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 cursor-pointer hover:bg-primary hover:text-white hover:border-transparent"
            label="+ Добавить товар"
            @click="addMiscLine"
          />
        </div>

        <div class="mt-4 space-y-3">
          <div
            v-for="line in miscLines"
            :key="line.id"
            class="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]"
          >
            <Select
              v-model="line.itemId"
              class="w-full"
              :options="miscProductOptions"
              option-label="label"
              option-value="value"
              placeholder="Товар"
            />
            <InputNumber v-model="line.count" class="w-full" input-class="w-full" :min="1" placeholder="Количество" />
            <div class="flex items-center">
              <Button
                unstyled
                class="rounded-2xl px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 cursor-pointer hover:bg-red-700 hover:text-white hover:border-transparent"
                label="Удалить"
                @click="removeMiscLine(line.id)"
              />
            </div>
          </div>
        </div>
      </Fieldset>

      <div class="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
        <Button
          v-if="miscEnabled || bouquetEnabled"
          label="Оформить заказ"
          class="rounded-2xl! font-semibold! px-5! py-3! dark:text-white!"
          :loading="loading"
          icon-pos="right"
          @click="submitOrder"
        />
      </div>

      <Message v-if="requestError" severity="error" class="mt-4">
        {{ requestError }}
      </Message>
    </div>

    <aside v-if="hasSidebar" class="space-y-4">
      <Card v-if="result" class="bg-card text-foreground">
        <template #content>
        <div class="space-y-3">
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
        </div>
        </template>
      </Card>

      <Card v-if="savedBouquet" class="bg-card text-foreground">
        <template #content>
        <div class="space-y-3">
          <h4 class="text-2xl font-semibold leading-tight">Букет сохранён</h4>
          <p class="text-sm text-muted-foreground">{{ formatDate(savedBouquet.createdAt) }}</p>
          <p class="text-sm">Цена: {{ savedBouquet.total }} KGS</p>
          <div class="flex flex-col items-center gap-4">
            <Image
              :src="savedBouquet.qrDataUrl"
              alt="QR code"
              image-class="h-40 w-40 rounded-lg bg-white p-2"
            />
            <Button
              unstyled
              class="w-full rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer bg-primary text-white hover:bg-primary/80"
              label="Печать"
              @click="printBouquetQr"
            />
          </div>
        </div>
        </template>
      </Card>
    </aside>
  </div>
</template>

<script setup lang="ts">
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
const loading = ref(false)

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
  loading.value = true
  requestError.value = ''

  const bouquet = bouquetEnabled.value ? buildBouquetPayload() : null
  const misc = miscEnabled.value ? buildMiscLines() : []

  if (!bouquet && misc.length === 0) {
    requestError.value = 'Добавь хотя бы одну позицию перед оформлением заказа'
    loading.value = false
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
  } finally {
    loading.value = false
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
