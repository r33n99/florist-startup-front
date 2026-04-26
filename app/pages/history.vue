<template>
  <NuxtPage v-if="isDetailRoute" />

  <div v-else-if="isHistoryLoading" class="flex min-h-[50vh] items-center justify-center">
    <AppLoader />
  </div>

  <div v-else class="space-y-6">
    <template v-if="!bouquetHistory.length || !miscHistory.length">
      <Card class="bg-transparent! border-none!">
        <template #content>
          <h4 class="text-lg font-semibold text-center">История заказов пуста</h4>
          <p class="text-sm text-muted-foreground mt-2">
            Сначала создайте заказ в <NuxtLink to="/" class="text-primary underline">Калькуляторе</NuxtLink>
          </p>
        </template>
      </Card>
    </template>
 <template v-else>
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

    <div v-if="currentUser" class="grid items-start gap-6 lg:grid-cols-2">
      <Card>
        <template #content>
          <h4 class="font-semibold">Букеты</h4>

        <Divider />

        <div v-if="!bouquetHistory.length" class="text-sm text-muted-foreground">
          Пока пусто.
        </div>

        <Accordion v-else v-model:value="openBouquetHistoryPanels" multiple class="space-y-3">
          <AccordionPanel
            v-for="entry in bouquetHistory"
            :key="entry.id"
            :value="entry.id"
            class="rounded-2xl border border-border/70"
          >
            <AccordionHeader>
              <div class="flex w-full items-center justify-between gap-3 pr-3">
                <span class="text-sm text-muted-foreground">{{ formatDate(entry.createdAt) }}</span>
                <span class="text-right">
                  <span class="block text-xs text-muted-foreground">Себестоимость: {{ entry.subtotal }} KGS</span>
                  <span class="text-sm font-medium">Итог: {{ entry.total }} KGS</span>
                </span>
              </div>
            </AccordionHeader>

            <AccordionContent>
              <div class="pt-2">
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
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
        </template>
      </Card>

      <Card>
        <template #content>
          <h4 class="font-semibold">Разные товары</h4>

        <Divider />

        <div v-if="!miscHistory.length" class="text-sm text-muted-foreground">
          Пока пусто.
        </div>

        <Accordion v-else v-model:value="openMiscHistoryPanels" multiple class="space-y-3">
          <AccordionPanel
            v-for="entry in miscHistory"
            :key="entry.id"
            :value="entry.id"
            class="rounded-2xl border border-border/70"
          >
            <AccordionHeader>
              <div class="flex w-full items-center justify-between gap-3 pr-3">
                <span>
                  <span class="block font-medium">{{ entry.name }}</span>
                  <span class="text-sm text-muted-foreground">{{ formatDate(entry.createdAt) }}</span>
                </span>
                <span class="text-right">
                  <span class="block text-xs text-muted-foreground">Себестоимость: {{ entry.subtotal }} KGS</span>
                  <span class="text-sm font-medium">Итог: {{ entry.total }} KGS</span>
                </span>
              </div>
            </AccordionHeader>

            <AccordionContent>
              <div class="pt-2">
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
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
        </template>
      </Card>
    </div>
 </template>
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
const openBouquetHistoryPanels = ref<string[]>([])
const openMiscHistoryPanels = ref<string[]>([])
const isHistoryLoading = ref(true)

const formatDate = (value: string) => new Date(value).toLocaleString('ru-RU')
const getFlowerName = (itemId: string) => flowers.value.find((flower) => flower.id === itemId)?.name ?? itemId

onMounted(async () => {
  if (!currentUser.value) {
    isHistoryLoading.value = false
    return
  }

  try {
    flowers.value = await loadFlowers()
    bouquetHistory.value = await loadBouquetHistory()
    miscHistory.value = await loadMiscHistory()
  } finally {
    isHistoryLoading.value = false
  }
})
</script>
