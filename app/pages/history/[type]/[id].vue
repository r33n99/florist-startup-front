<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <NuxtLink
        to="/history"
        class="rounded-2xl bg-(--q-primary) px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
      >
        Назад к истории
      </NuxtLink>
        <h4 class="text-2xl font-semibold">
          {{ pageTitle }}
        </h4>
      </div>
    </div>

    <QBanner v-if="loadError" :dark="isDark" rounded class="bg-red-1 text-negative">
      {{ loadError }}
    </QBanner>

    <QCard v-else-if="detailEntry" :dark="isDark" flat bordered class="bg-card text-foreground">
      <QCardSection class="space-y-2">
        <p class="text-sm text-muted-foreground">Дата: {{ formatDate(detailEntry.createdAt) }}</p>
        <p class="text-sm text-muted-foreground">Себестоимость: {{ detailEntry.subtotal }} KGS</p>
        <p class="text-base font-medium">Итог: {{ detailEntry.total }} KGS</p>
      </QCardSection>

      <QSeparator :dark="isDark" />

      <QCardSection v-if="isBouquetDetail && bouquetDetail">
        <p class="mb-3 font-medium">Состав букета</p>
        <ul class="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li v-for="line in bouquetDetail.input.lines" :key="`${bouquetDetail.id}:${line.itemId}`">
            {{ getFlowerName(line.itemId) }} x {{ line.count }}
          </li>
        </ul>

        <div v-if="bouquetDetail.qrDataUrl" class="mt-6 flex items-center gap-4">
          <img :src="bouquetDetail.qrDataUrl" alt="QR code" class="h-40 w-40 rounded-lg border bg-white p-2">
        </div>
      </QCardSection>

      <QCardSection v-else-if="miscDetail">
        <p class="mb-3 font-medium">Состав товаров</p>
        <ul class="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li v-for="line in miscDetail.breakdown" :key="`${miscDetail.id}:${line.itemId}`">
            {{ line.itemName }} x {{ line.count }}
          </li>
        </ul>
      </QCardSection>
    </QCard>

    <QCard v-else :dark="isDark" flat bordered class="bg-card text-foreground">
      <QCardSection class="text-sm text-muted-foreground">
        Запись не найдена.
      </QCardSection>
    </QCard>
  </div>
</template>

<script setup lang="ts">
import { QBanner, QCard, QCardSection, QSeparator } from 'quasar'

const route = useRoute()
const theme = useCookie<'light' | 'dark'>('florist-theme', {
  default: () => 'light',
  sameSite: 'lax',
})

const isDark = computed(() => theme.value === 'dark')

type BouquetLine = {
  itemId: string
  count: number
}

type FlowerItem = {
  id: string
  name: string
}

type CalculationBreakdown = {
  itemId: string
  itemName: string
  count: number
}

type BouquetDetail = {
  id: string
  name: string
  createdAt: string
  subtotal: number
  total: number
  qrDataUrl?: string
  input: {
    lines: BouquetLine[]
  }
}

type MiscDetail = {
  id: string
  name: string
  createdAt: string
  subtotal: number
  total: number
  breakdown: CalculationBreakdown[]
}

const { currentUser, loadBouquetHistory, loadFlowers, loadMiscHistory } = useBouquetCalculator()
const bouquetDetail = ref<BouquetDetail | null>(null)
const miscDetail = ref<MiscDetail | null>(null)
const flowers = ref<FlowerItem[]>([])
const loadError = ref('')

const typeParam = computed(() => String(route.params.type ?? ''))
const idParam = computed(() => String(route.params.id ?? ''))
const isBouquetDetail = computed(() => typeParam.value === 'bouquets')
const pageTitle = computed(() => (isBouquetDetail.value ? 'Детали букета' : 'Детали товара'))
const detailEntry = computed(() => bouquetDetail.value ?? miscDetail.value)

const formatDate = (value: string) => new Date(value).toLocaleString('ru-RU')
const getFlowerName = (itemId: string) => flowers.value.find((flower) => flower.id === itemId)?.name ?? itemId

onMounted(async () => {
  if (!currentUser.value) {
    loadError.value = 'Сначала войди, чтобы посмотреть историю.'
    return
  }

  try {
    if (isBouquetDetail.value) {
      const [history, flowerCatalog] = await Promise.all([
        loadBouquetHistory(),
        loadFlowers(),
      ])

      flowers.value = flowerCatalog
      bouquetDetail.value = history.find((entry) => entry.id === idParam.value) ?? null
      return
    }

    const history = await loadMiscHistory()
    miscDetail.value = history.find((entry) => entry.id === idParam.value) ?? null
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Не удалось загрузить детали записи.'
  }
})
</script>
