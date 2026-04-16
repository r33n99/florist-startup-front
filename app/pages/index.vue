<template>
  <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
    <QCard :dark="isDark" flat bordered class="bg-card text-foreground">
      <QCardSection class="flex items-start justify-between gap-4">
        <div>
          <p class="mt-1 text-sm text-muted-foreground">
            Смешанный расчёт: букет и разные товары в одном заказе.
          </p>
        </div>

      </QCardSection>
 
      <QSeparator :dark="isDark" />

      <QCardSection v-if="!currentUser">
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

      <QCardSection v-else>
        <div class="flex flex-wrap gap-3">
          <QBtn
            :dark="isDark"
            unelevated
            no-caps
            :color="bouquetEnabled ? 'primary' : 'grey-7'"
            :outline="!bouquetEnabled"
            class="rounded-2xl"
            label="Букет"
            @click="toggleBouquet"
          />
          <QBtn
            :dark="isDark"
            unelevated
            no-caps
            :color="miscEnabled ? 'primary' : 'grey-7'"
            :outline="!miscEnabled"
            class="rounded-2xl"
            label="Разные товары"
            @click="toggleMisc"
          />
        </div>

        <QCard :dark="isDark" v-if="bouquetEnabled" flat bordered class="mt-6 bg-card">
          <QCardSection class="flex items-center justify-between gap-4">
            <div>
              <h3 class="font-semibold">Состав букета</h3>
              <p class="text-sm text-muted-foreground">
                Каталог цветов загружается отдельно и QR будет только для этой части.
              </p>
            </div>
            <QBtn :dark="isDark" class="rounded-2xl" outline no-caps color="primary" label="+ Добавить цветок" @click="addBouquetLine" />
          </QCardSection>

          <QSeparator :dark="isDark" />

          <QCardSection class="space-y-3">
            <QCard
              :dark="isDark"
              v-for="line in bouquetLines"
              :key="line.id"
              flat
              bordered
              class="bg-background"
            >
              <QCardSection class="grid gap-3 md:grid-cols-3">
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
                <div class="flex items-end">
                  <QBtn :dark="isDark" class="rounded-2xl" flat no-caps color="negative" label="Удалить" @click="removeBouquetLine(line.id)" />
                </div>
              </QCardSection>
            </QCard>
          </QCardSection>

          <QSeparator :dark="isDark" />

          <QCardSection class="grid gap-3 md:grid-cols-3">
            <QInput :dark="isDark" v-model.number="markupPercent" outlined type="number" min="0" label="Наценка (%)" />
            <QInput :dark="isDark" v-model.number="packagingCost" outlined type="number" min="0" label="Упаковка (KGS)" />
            <QInput :dark="isDark" v-model.number="laborCost" outlined type="number" min="0" label="Работа флориста (KGS)" />
          </QCardSection>
        </QCard>

        <QCard :dark="isDark" v-if="miscEnabled" flat bordered class="mt-6 bg-card">
          <QCardSection class="flex items-center justify-between gap-4">
            <div>
              <h3 class="font-semibold">Разные товары</h3>
              <p class="text-sm text-muted-foreground">
                Открытки, грунт, домашние цветы и другие доп. позиции.
              </p>
            </div>
            <QBtn :dark="isDark" class="rounded-2xl" outline no-caps color="primary" label="+ Добавить товар" @click="addMiscLine" />
          </QCardSection>

          <QSeparator :dark="isDark" />

          <QCardSection class="space-y-3">
            <QCard
              :dark="isDark"
              v-for="line in miscLines"
              :key="line.id"
              flat
              bordered
              class="bg-background"
            >
              <QCardSection class="grid gap-3 md:grid-cols-3">
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
                <div class="flex items-end">
                  <QBtn :dark="isDark" class="rounded-2xl" flat no-caps color="negative" label="Удалить" @click="removeMiscLine(line.id)" />
                </div>
              </QCardSection>
            </QCard>
          </QCardSection>
        </QCard>

        <div class="mt-6 flex flex-wrap gap-3">
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
      </QCardSection>
    </QCard>

    <aside class="space-y-4">
      <QCard :dark="isDark" v-if="result" flat bordered class="bg-card text-foreground">
        <QCardSection>
          <h3 class="font-semibold">Итог расчёта</h3>

          <div class="mt-4 space-y-2 text-sm">
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

      <QCard :dark="isDark" v-if="savedBouquet" flat bordered class="bg-card text-foreground">
        <QCardSection>
          <h3 class="font-semibold">Букет сохранён</h3>
          <p class="mt-2 text-sm text-muted-foreground">{{ formatDate(savedBouquet.createdAt) }}</p>
          <p class="text-sm">Цена: {{ savedBouquet.total }} KGS</p>
          <div class="mt-3 flex items-center gap-4">
            <img :src="savedBouquet.qrDataUrl" alt="QR code" class="h-40 w-40 rounded-lg border bg-white p-2">
            <QBtn
              :dark="isDark"
              unelevated
              no-caps
              color="primary"
              class="rounded-2xl"
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
import { QBanner, QBtn, QCard, QCardSection, QInput, QSelect, QSeparator } from 'quasar'

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
</script>
