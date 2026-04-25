<template>
  <NuxtPage v-if="isDetailRoute" />

  <div v-else class="space-y-6">
    <Card>
      <template #content>
        <div class="flex items-start justify-between gap-4">
          <h4 class="text-lg font-semibold">История заказов</h4>
        </div>

        <Message v-if="!currentUser" severity="warn" class="mt-4">
          Сначала войди на странице `Калькулятор`, чтобы посмотреть историю.
        </Message>
      </template>
    </Card>

    <div v-if="currentUser" class="grid gap-6 lg:grid-cols-2">
      <Card>
        <template #content>
          <h4 class="font-semibold">Букеты</h4>

        <Divider />

        <div v-if="!bouquetHistory.length" class="text-sm text-muted-foreground">
          Пока пусто.
        </div>

        <div v-else class="space-y-3">
          <details
            v-for="entry in bouquetHistory"
            :key="entry.id"
            class="rounded-2xl border border-border/70 p-4"
          >
            <summary class="flex cursor-pointer items-center justify-between gap-3">
              <span class="text-sm text-muted-foreground">{{ formatDate(entry.createdAt) }}</span>
              <span class="text-right">
                <span class="block text-xs text-muted-foreground">Себестоимость: {{ entry.subtotal }} KGS</span>
                <span class="text-sm font-medium">Итог: {{ entry.total }} KGS</span>
              </span>
            </summary>

            <div class="mt-4">
              <p class="mb-2 font-medium">Состав букета</p>
              <ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li v-for="line in entry.input.lines" :key="`${entry.id}:${line.itemId}`">
                  {{ getFlowerName(line.itemId) }} x {{ line.count }}
                </li>
              </ul>
              <NuxtLink
                :to="`/history/bouquets/${entry.id}`"
                class="mt-3 inline-flex rounded-2xl bg-primary px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
              >
                Подробнее
              </NuxtLink>
            </div>
          </details>
        </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <h4 class="font-semibold">Разные товары</h4>

        <Divider />

        <div v-if="!miscHistory.length" class="text-sm text-muted-foreground">
          Пока пусто.
        </div>

        <div v-else class="space-y-3">
          <details
            v-for="entry in miscHistory"
            :key="entry.id"
            class="rounded-2xl border border-border/70 p-4"
          >
            <summary class="flex cursor-pointer items-center justify-between gap-3">
              <span>
                <span class="block font-medium">{{ entry.name }}</span>
                <span class="text-sm text-muted-foreground">{{ formatDate(entry.createdAt) }}</span>
              </span>
              <span class="text-right">
                <span class="block text-xs text-muted-foreground">Себестоимость: {{ entry.subtotal }} KGS</span>
                <span class="text-sm font-medium">Итог: {{ entry.total }} KGS</span>
              </span>
            </summary>

            <div class="mt-4">
              <p class="mb-2 font-medium">Товары</p>
              <ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li v-for="line in entry.breakdown" :key="`${entry.id}:${line.itemId}`">
                  {{ line.itemName }} x {{ line.count }}
                </li>
              </ul>
              <NuxtLink
                :to="`/history/misc/${entry.id}`"
                class="mt-3 inline-flex rounded-2xl bg-primary px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
              >
                Подробнее
              </NuxtLink>
            </div>
          </details>
        </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const isDetailRoute = computed(() => {
  return typeof route.params.type === 'string' && typeof route.params.id === 'string'
})

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
