<template>
  <div class="space-y-6">
    <div v-if="isProductsLoading" class="flex min-h-[50vh] items-center justify-center">
      <AppLoader />
    </div>

    <Card v-else-if="!currentUser" class="bg-card text-foreground">
      <template #content>
        <Message severity="warn">
          Сначала войди в систему.
        </Message>
      </template>
    </Card>

    <Card v-else-if="!isAdmin" class="bg-card text-foreground">
      <template #content>
        <Message severity="warn">
          Доступ к товарам есть только у администратора.
        </Message>
      </template>
    </Card>

    <Fieldset v-else class="bg-background/60">
      <template #legend>
        <div class="space-y-1">
          <p class="font-semibold">Админ-панель товаров</p>
          <p class="text-sm font-normal text-muted-foreground">Добавление и обновление названий, цен и категорий.</p>
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
          <FloatLabel variant="on" >
            <InputText fluid id="new-flower-name" v-model="newFlowerForm.name" placeholder="Новый цветок" />
            <label for="new-flower-name">Название цветка</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputNumber fluid id="new-flower-price" v-model="newFlowerForm.unitCost" class="w-full" input-class="w-full" :min="0" placeholder="Цена" />
            <label for="new-flower-price">Цена (KGS)</label>
          </FloatLabel>
          <Button label="Добавить цветок" :loading="adminLoading" @click="handleCreateFlower" />
        </div>

        <div
          v-for="flower in flowers"
          :key="`admin-flower-${flower.id}`"
          class="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto_auto]"
        >
          <FloatLabel variant="on">
            <InputText fluid :id="`flower-name-${flower.id}`" v-model="flower.name" />
            <label :for="`flower-name-${flower.id}`">Название цветка</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputNumber fluid :id="`flower-price-${flower.id}`" v-model="flower.unitCost" class="w-full" input-class="w-full" :min="0" />
            <label :for="`flower-price-${flower.id}`">Цена (KGS)</label>
          </FloatLabel>
          <Button label="Сохранить" :loading="adminLoading" @click="handleUpdateFlower(flower)" />
          <Button severity="danger" label="Удалить" :loading="adminLoading" @click="handleDeleteFlower(flower)" />
        </div>
      </div>

      <Divider />

      <div class="space-y-4">
        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_200px_auto]">
          <FloatLabel variant="on">
            <InputText fluid id="new-misc-name" v-model="newMiscForm.name" placeholder="Новый товар" />
            <label for="new-misc-name">Название товара</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputNumber fluid id="new-misc-price" v-model="newMiscForm.unitCost" class="w-full" input-class="w-full" :min="0" placeholder="Цена" />
            <label for="new-misc-price">Цена (KGS)</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <Select
              fluid
              id="new-misc-category"
              v-model="newMiscForm.category"
              :options="miscCategoryOptions"
              option-label="label"
              option-value="value"
              placeholder="Категория"
            />
            <label for="new-misc-category">Категория</label>
          </FloatLabel>
          <Button label="Добавить товар" :loading="adminLoading" @click="handleCreateMiscProduct" />
        </div>

        <div
          v-for="product in miscProducts"
          :key="`admin-misc-${product.id}`"
          class="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_180px_200px_auto_auto]"
        >
          <FloatLabel variant="on">
            <InputText fluid :id="`misc-name-${product.id}`" v-model="product.name" />
            <label :for="`misc-name-${product.id}`">Название товара</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputNumber fluid :id="`misc-price-${product.id}`" v-model="product.unitCost" class="w-full" input-class="w-full" :min="0" />
            <label :for="`misc-price-${product.id}`">Цена (KGS)</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <Select
              fluid
              :id="`misc-category-${product.id}`"
              v-model="product.category"
              :options="miscCategoryOptions"
              option-label="label"
              option-value="value"
              placeholder="Категория"
            />
            <label :for="`misc-category-${product.id}`">Категория</label>
          </FloatLabel>
          <Button label="Сохранить" :loading="adminLoading" @click="handleUpdateMiscProduct(product)" />
          <Button severity="danger" label="Удалить" :loading="adminLoading" @click="handleDeleteMiscProduct(product)" />
        </div>
      </div>

      <Message v-if="adminError" :life="5000" severity="error" class="mt-4">
        {{ adminError }}
      </Message>
      <Message v-if="adminSuccess" :life="5000" severity="success" class="mt-4">
        {{ adminSuccess }}
      </Message>
    </Fieldset>
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
  category: 'card' | 'soil' | 'houseplant' | 'gift' | 'packaging'
}

const {
  currentUser,
  loadFlowers,
  loadMiscProducts,
  createFlower,
  updateFlower,
  deleteFlower,
  createMiscProduct,
  updateMiscProduct,
  deleteMiscProduct,
} = useBouquetCalculator()

const isAdmin = computed(() => currentUser.value?.role === 'admin')
const flowers = ref<FlowerItem[]>([])
const miscProducts = ref<MiscProduct[]>([])
const adminLoading = ref(false)
const isProductsLoading = ref(true)
const adminError = ref('')
const adminSuccess = ref('')
const miscCategoryOptions = [
  { label: 'Открытки', value: 'card' },
  { label: 'Грунт', value: 'soil' },
  { label: 'Комнатные растения', value: 'houseplant' },
  { label: 'Подарки', value: 'gift' },
  { label: 'Упаковка', value: 'packaging' },
]
const newFlowerForm = reactive({
  name: '',
  unitCost: 0,
})
const newMiscForm = reactive<{
  name: string
  unitCost: number
  category: MiscProduct['category']
}>({
  name: '',
  unitCost: 0,
  category: 'gift',
})

const refreshCatalog = async () => {
  const [nextFlowers, nextMiscProducts] = await Promise.all([
    loadFlowers(),
    loadMiscProducts(),
  ])
  flowers.value = nextFlowers
  miscProducts.value = nextMiscProducts
}

const handleCreateFlower = async () => {
  adminError.value = ''
  adminSuccess.value = ''
  if (!newFlowerForm.name.trim()) {
    adminError.value = 'Укажи название цветка'
    return
  }

  adminLoading.value = true
  isProductsLoading.value = true
  try {
    await createFlower({
      name: newFlowerForm.name.trim(),
      unitCost: Number(newFlowerForm.unitCost || 0),
    })
    await refreshCatalog()
    newFlowerForm.name = ''
    newFlowerForm.unitCost = 0
    adminSuccess.value = 'Цветок добавлен'
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : 'Не удалось добавить цветок'
  } finally {
    adminLoading.value = false
    isProductsLoading.value = false
  }
}

const handleUpdateFlower = async (flower: FlowerItem) => {
  adminError.value = ''
  adminSuccess.value = ''
  adminLoading.value = true
  isProductsLoading.value = true
  try {
    await updateFlower(flower.id, {
      name: flower.name.trim(),
      unitCost: Number(flower.unitCost || 0),
    })
    await refreshCatalog()
    adminSuccess.value = `Цветок "${flower.name}" обновлён`
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : 'Не удалось обновить цветок'
  } finally {
    adminLoading.value = false
    isProductsLoading.value = false
  }
}

const handleDeleteFlower = async (flower: FlowerItem) => {
  if (!import.meta.client) {
    return
  }
  if (!window.confirm(`Удалить цветок "${flower.name}"?`)) {
    return
  }

  adminError.value = ''
  adminSuccess.value = ''
  adminLoading.value = true
  isProductsLoading.value = true
  try {
    await deleteFlower(flower.id)
    await refreshCatalog()
    adminSuccess.value = `Цветок "${flower.name}" удалён`
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : 'Не удалось удалить цветок'
  } finally {
    adminLoading.value = false
    isProductsLoading.value = false
  }
}

const handleCreateMiscProduct = async () => {
  adminError.value = ''
  adminSuccess.value = ''
  if (!newMiscForm.name.trim()) {
    adminError.value = 'Укажи название товара'
    return
  }

  adminLoading.value = true
  isProductsLoading.value = true
  try {
    await createMiscProduct({
      name: newMiscForm.name.trim(),
      unitCost: Number(newMiscForm.unitCost || 0),
      category: newMiscForm.category,
    })
    await refreshCatalog()
    newMiscForm.name = ''
    newMiscForm.unitCost = 0
    newMiscForm.category = 'gift'
    adminSuccess.value = 'Товар добавлен'
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : 'Не удалось добавить товар'
  } finally {
    adminLoading.value = false
    isProductsLoading.value = false
  }
}

const handleUpdateMiscProduct = async (product: MiscProduct) => {
  adminError.value = ''
  adminSuccess.value = ''
  adminLoading.value = true
  isProductsLoading.value = true
  try {
    await updateMiscProduct(product.id, {
      name: product.name.trim(),
      unitCost: Number(product.unitCost || 0),
      category: product.category,
    })
    await refreshCatalog()
    adminSuccess.value = `Товар "${product.name}" обновлён`
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : 'Не удалось обновить товар'
  } finally {
    adminLoading.value = false
    isProductsLoading.value = false
  }
}

const handleDeleteMiscProduct = async (product: MiscProduct) => {
  if (!import.meta.client) {
    return
  }
  if (!window.confirm(`Удалить товар "${product.name}"?`)) {
    return
  }

  adminError.value = ''
  adminSuccess.value = ''
  adminLoading.value = true
  isProductsLoading.value = true
  try {
    await deleteMiscProduct(product.id)
    await refreshCatalog()
    adminSuccess.value = `Товар "${product.name}" удалён`
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : 'Не удалось удалить товар'
  } finally {
    adminLoading.value = false
    isProductsLoading.value = false
  }
}

onMounted(async () => {
  if (!currentUser.value || !isAdmin.value) {
    isProductsLoading.value = false
    return
  }

  try {
    await refreshCatalog()
  } finally {
    isProductsLoading.value = false
  }
})
</script>
