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

type BouquetLine = {
  itemId: string
  count: number
}

type MiscLine = {
  itemId: string
  count: number
}

type BouquetCalculationInput = {
  lines: BouquetLine[]
  markupPercent: number
  packagingCost: number
  laborCost: number
}

type MixedCalculationInput = {
  bouquet: BouquetCalculationInput | null
  miscLines: MiscLine[]
}

type CalculationBreakdown = {
  itemId: string
  itemName: string
  itemType: 'flower' | 'misc'
  count: number
  unitCost: number
  lineTotal: number
}

type BouquetCalculationResult = {
  subtotal: number
  total: number
  breakdown: CalculationBreakdown[]
}

type MixedCalculationResult = {
  bouquet: BouquetCalculationResult | null
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
  subtotal: number
  total: number
  qrDataUrl: string
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

type AuthUser = {
  id: string
  username: string
  role: 'admin' | 'user'
  displayName: string
}

type LoginResponse = {
  token: string
  user: AuthUser
}

export const useBouquetCalculator = () => {
  const config = useRuntimeConfig()
  const authToken = useCookie<string | null>('florist-token', {
    default: () => null,
    sameSite: 'lax',
  })
  const currentUserCookie = useCookie<AuthUser | null>('florist-current-user', {
    default: () => null,
    sameSite: 'lax',
  })
  const currentUser = useState<AuthUser | null>('florist-current-user', () => currentUserCookie.value)

  const authHeaders = computed<Record<string, string> | undefined>(() => {
    if (!authToken.value) {
      return undefined
    }

    return {
      Authorization: `Bearer ${authToken.value}`,
    }
  })

  const flowersRequest = useFetch<FlowerItem[]>('/flowers', {
    baseURL: config.public.apiBase,
    key: 'flowers:catalog',
    immediate: false,
    server: false,
    headers: authHeaders,
  })
  const miscProductsRequest = useFetch<MiscProduct[]>('/misc-products', {
    baseURL: config.public.apiBase,
    key: 'misc-products:catalog',
    immediate: false,
    server: false,
    headers: authHeaders,
  })

  const loadFlowers = async (): Promise<FlowerItem[]> => {
    await flowersRequest.execute()
    
    if (flowersRequest.error.value) {
      console.error('Failed to load flowers', flowersRequest.error.value)
      return []
    }

    return flowersRequest.data.value ?? []
  }

  const loadMiscProducts = async (): Promise<MiscProduct[]> => {
    await miscProductsRequest.execute()

    if (miscProductsRequest.error.value) {
      console.error('Failed to load misc products', miscProductsRequest.error.value)
      return []
    }

    return miscProductsRequest.data.value ?? []
  }

  const login = async (username: string, password: string) => {
    const response = await $fetch<LoginResponse>('/auth/login', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: { username, password },
    })

    authToken.value = response.token
    currentUser.value = response.user
    currentUserCookie.value = response.user
    return response.user
  }

  const logout = () => {
    authToken.value = null
    currentUser.value = null
    currentUserCookie.value = null
  }

  const calculateMixed = async (input: MixedCalculationInput) => {
    return $fetch<MixedCalculationResult>('/calculate/mixed', {
      method: 'POST',
      baseURL: config.public.apiBase,
      headers: authHeaders.value,
      body: input,
    })
  }

  const saveBouquetHistory = async (input: BouquetCalculationInput, orderGroupId?: string) => {
    return $fetch<SavedBouquet>('/history/bouquets', {
      method: 'POST',
      baseURL: config.public.apiBase,
      headers: authHeaders.value,
      body: {
        ...input,
        orderGroupId: orderGroupId ?? null,
      },
    })
  }

  const saveMiscHistory = async (lines: MiscLine[], orderGroupId?: string) => {
    return $fetch<SavedMiscHistory>('/history/misc', {
      method: 'POST',
      baseURL: config.public.apiBase,
      headers: authHeaders.value,
      body: {
        lines,
        orderGroupId: orderGroupId ?? null,
      },
    })
  }

  const loadBouquetHistory = async () => {
    return $fetch<SavedBouquet[]>('/history/bouquets', {
      baseURL: config.public.apiBase,
      headers: authHeaders.value,
    })
  }

  const loadMiscHistory = async () => {
    return $fetch<SavedMiscHistory[]>('/history/misc', {
      baseURL: config.public.apiBase,
      headers: authHeaders.value,
    })
  }

  return {
    authToken,
    currentUser,
    loadFlowers,
    loadMiscProducts,
    login,
    logout,
    calculateMixed,
    saveBouquetHistory,
    saveMiscHistory,
    loadBouquetHistory,
    loadMiscHistory,
  }
}
