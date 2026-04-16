<template>
  <div class="space-y-6">
    <QCard :dark="isDark" flat bordered class="bg-card text-foreground">
      <QCardSection class="flex items-start justify-between gap-4">
        <div>
          <h4 class="text-lg font-semibold">История заказов</h4>
        </div>
      </QCardSection>

      <QCardSection v-if="!currentUser">
        <QBanner :dark="isDark" rounded class="bg-amber-1 text-amber-9">
          Сначала войди на странице `Калькулятор`, чтобы посмотреть историю.
        </QBanner>
      </QCardSection>
    </QCard>

    <div v-if="currentUser" class="grid gap-6 lg:grid-cols-2">
      <QCard :dark="isDark" flat bordered class="bg-card text-foreground">
        <QCardSection>
          <h3 class="font-semibold">Букеты</h3>
        </QCardSection>

        <QSeparator :dark="isDark" />

        <QCardSection v-if="!bouquetHistory.length" class="text-sm text-muted-foreground">
          Пока пусто.
        </QCardSection>

        <QList :dark="isDark" v-else separator padding>
          <QExpansionItem
            :dark="isDark"
            v-for="entry in bouquetHistory"
            :key="entry.id"
            expand-separator
            dense
            header-class="rounded-xl"
          >
            <template #header>
              <QItemSection>
                <QItemLabel class="font-medium">{{ entry.name }}</QItemLabel>
                <QItemLabel caption>{{ formatDate(entry.createdAt) }}</QItemLabel>
              </QItemSection>
              <QItemSection side>
                <div class="text-right">
                  <p class="text-xs text-muted-foreground">Себестоимость: {{ entry.subtotal }} KGS</p>
                  <p class="text-sm font-medium">Итог: {{ entry.total }} KGS</p>
                </div>
              </QItemSection>
            </template>

            <QCard :dark="isDark" flat class="bg-background">
              <QCardSection>
                <p class="mb-2 font-medium">Состав букета</p>
                <ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li v-for="line in entry.input.lines" :key="`${entry.id}:${line.itemId}`">
                    {{ getFlowerName(line.itemId) }} x {{ line.count }}
                  </li>
                </ul>
                <NuxtLink
                  :to="`/history/bouquets/${entry.id}`"
                  class="mt-3 inline-flex rounded-2xl bg-(--q-primary) px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
                >
                  Открыть подробно
                </NuxtLink>
              </QCardSection>
            </QCard>
          </QExpansionItem>
        </QList>
      </QCard>

      <QCard :dark="isDark" flat bordered class="bg-card text-foreground">
        <QCardSection>
          <h3 class="font-semibold">Разные товары</h3>
        </QCardSection>

        <QSeparator :dark="isDark" />

        <QCardSection v-if="!miscHistory.length" class="text-sm text-muted-foreground">
          Пока пусто.
        </QCardSection>

        <QList :dark="isDark" v-else separator padding>
          <QExpansionItem
            :dark="isDark"
            v-for="entry in miscHistory"
            :key="entry.id"
            expand-separator
            dense
            header-class="rounded-xl"
          >
            <template #header>
              <QItemSection>
                <QItemLabel class="font-medium">{{ entry.name }}</QItemLabel>
                <QItemLabel caption>{{ formatDate(entry.createdAt) }}</QItemLabel>
              </QItemSection>
              <QItemSection side>
                <div class="text-right">
                  <p class="text-xs text-muted-foreground">Себестоимость: {{ entry.subtotal }} KGS</p>
                  <p class="text-sm font-medium">Итог: {{ entry.total }} KGS</p>
                </div>
              </QItemSection>
            </template>

            <QCard :dark="isDark" flat class="bg-background">
              <QCardSection>
                <p class="mb-2 font-medium">Товары</p>
                <ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li v-for="line in entry.breakdown" :key="`${entry.id}:${line.itemId}`">
                    {{ line.itemName }} x {{ line.count }}
                  </li>
                </ul>
                <NuxtLink
                  :to="`/history/misc/${entry.id}`"
                  class="mt-3 inline-flex rounded-2xl bg-(--q-primary) px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
                >
                  Открыть подробно
                </NuxtLink>
              </QCardSection>
            </QCard>
          </QExpansionItem>
        </QList>
      </QCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QBanner, QCard, QCardSection, QExpansionItem, QItemLabel, QItemSection, QList, QSeparator } from 'quasar'

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

type SavedBouquet = {
  id: string
  name: string
  createdAt: string
  subtotal: number
  total: number
  input: {
    lines: BouquetLine[]
  }
}

type SavedMiscHistory = {
  id: string
  name: string
  createdAt: string
  subtotal: number
  total: number
  breakdown: CalculationBreakdown[]
}

const { currentUser, loadBouquetHistory, loadFlowers, loadMiscHistory } = useBouquetCalculator()
const bouquetHistory = ref<SavedBouquet[]>([])
const miscHistory = ref<SavedMiscHistory[]>([])
const flowers = ref<FlowerItem[]>([])

const formatDate = (value: string) => new Date(value).toLocaleString('ru-RU')
const getFlowerName = (itemId: string) => flowers.value.find((flower) => flower.id === itemId)?.name ?? itemId

onMounted(async () => {
  if (!currentUser.value) {
    return
  }

  flowers.value = await loadFlowers()
  bouquetHistory.value = await loadBouquetHistory()
  miscHistory.value = await loadMiscHistory()
})
</script>
