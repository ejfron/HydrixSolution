<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient } from '#imports'
import { Plus, X, CheckCircle, Trash2, ImagePlus, Droplets, ShoppingCart, Users } from '@lucide/vue'
import Navbar from '~/components/user/Navbar.vue'
import Sidebar from '~/components/user/Sidebar.vue'
import SalesStats from '~/components/user/SalesStats.vue'
import { useSubscription } from '~/composables/useSubscription'

const client = useSupabaseClient()
const user = useSupabaseUser()
const { isExpired, nextPaymentDate, daysRemaining, checkSubscription } = useSubscription()

// ─── Types ──────────────────────────────────────────────────────
type GallonType = {
  id: string
  name: string
  size: number
  unit: string
  price: number
  image_url: string | null
  is_active: boolean
}

type TransactionType = 'regular' | 'reseller'

// ─── State ──────────────────────────────────────────────────────
const gallonTypes = ref<GallonType[]>([])
const stats = ref({ today: 0, yesterday: 0, thisMonth: 0, thisYear: 0, totalGallons: 0 })

// Create gallon modal
const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')
const newName = ref('')
const newSize = ref<number | null>(null)
const newUnit = ref('gallon')
const newPrice = ref<number | null>(null)
const newImageFile = ref<File | null>(null)
const newImagePreview = ref<string | null>(null)

// Dispense modal
const showDispenseModal = ref(false)
const selectedGallon = ref<GallonType | null>(null)

// Transaction type modal
const showTypeModal = ref(false)
const selectedType = ref<TransactionType | null>(null)

// Reseller form
const resellerQty = ref<number | null>(null)
const resellerPrice = ref<number | null>(null)

// Regular quantity input  // <-- NEW
const regularQty = ref<number>(1)  // <-- NEW

// Status
const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const deletingId = ref<string | null>(null)

// ─── Computed ───────────────────────────────────────────────────
const resellerTotal = computed(() => {
  if (!resellerQty.value || !resellerPrice.value) return 0
  return resellerQty.value * resellerPrice.value
})

// Total for regular dispense  // <-- NEW
const regularTotal = computed(() => {   // <-- NEW
  if (!selectedGallon.value) return 0
  return (regularQty.value || 1) * selectedGallon.value.price
})

// ─── Fetch gallon types ─────────────────────────────────────────
const fetchGallonTypes = async () => {
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return

  const { data } = await client
    .from('gallon_types')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .returns<GallonType[]>()

  if (data) gallonTypes.value = data
}

// ─── Fetch sales stats ──────────────────────────────────────────
const fetchSales = async () => {
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return

  const { data } = await client
    .from('transactions')
    .select('total_amount, created_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .returns<{ total_amount: number; created_at: string }[]>()

  if (!data) return

  const now = new Date()
  const todayStr = now.toDateString()
  const yesterdayStr = new Date(now.getTime() - 86400000).toDateString()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  let today = 0, yesterday = 0, month = 0, year = 0

  for (const t of data) {
    const d = new Date(t.created_at)
    const amt = Number(t.total_amount)
    if (d.toDateString() === todayStr) today += amt
    if (d.toDateString() === yesterdayStr) yesterday += amt
    if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) month += amt
    if (d.getFullYear() === thisYear) year += amt
  }

  stats.value = { today, yesterday, thisMonth: month, thisYear: year, totalGallons: 0 }
}

// ─── Image upload ───────────────────────────────────────────────
const handleImageSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  newImageFile.value = file
  newImagePreview.value = URL.createObjectURL(file)
}

const uploadImage = async (userId: string): Promise<string | null> => {
  if (!newImageFile.value) return null

  const ext = newImageFile.value.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`

  const { error } = await client.storage
    .from('gallon-images')
    .upload(path, newImageFile.value)

  if (error) return null

  const { data } = client.storage
    .from('gallon-images')
    .getPublicUrl(path)

  return data.publicUrl
}

// ─── Create gallon type ─────────────────────────────────────────
const createGallonType = async () => {
  if (!newName.value || !newSize.value || !newPrice.value) {
    createError.value = 'Please fill in all required fields.'
    return
  }

  // ─── Duplicate check ──────────────────────────────────────
  const duplicate = gallonTypes.value.some(
    g =>
      g.name.toLowerCase() === newName.value.toLowerCase() &&
      g.size === newSize.value &&
      g.unit === newUnit.value
  )

  if (duplicate) {
    createError.value = 'A gallon with this name, size and unit already exists.'
    return
  }

  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return

  creating.value = true
  createError.value = ''

  const imageUrl = await uploadImage(userId)

  const { error } = await (client.from('gallon_types') as any).insert({
    user_id: userId,
    name: newName.value,
    size: newSize.value,
    unit: newUnit.value,
    price: newPrice.value,
    image_url: imageUrl,
  })

  if (error) {
    createError.value = error.message
    creating.value = false
    return
  }

  // Reset form
  newName.value = ''
  newSize.value = null
  newUnit.value = 'gallon'
  newPrice.value = null
  newImageFile.value = null
  newImagePreview.value = null
  creating.value = false
  showCreateModal.value = false

  await fetchGallonTypes()
}

// ─── Delete gallon type ─────────────────────────────────────────
const deleteGallonType = async (id: string) => {
  deletingId.value = id
  await (client.from('gallon_types') as any)
    .update({ is_active: false })
    .eq('id', id)

  gallonTypes.value = gallonTypes.value.filter(g => g.id !== id)
  deletingId.value = null
}

// ─── Open dispense flow ─────────────────────────────────────────
const openDispense = (gallon: GallonType) => {
  if (isExpired.value) return
  selectedGallon.value = gallon
  selectedType.value = null
  resellerQty.value = null
  resellerPrice.value = null
  regularQty.value = 1   // <-- NEW: reset to 1
  errorMsg.value = ''
  successMsg.value = ''
  showTypeModal.value = true
}

const selectType = (type: TransactionType) => {
  selectedType.value = type
  showTypeModal.value = false
  showDispenseModal.value = true
}

const closeDispenseModal = () => {
  showDispenseModal.value = false
  showTypeModal.value = false
  selectedGallon.value = null
  selectedType.value = null
  resellerQty.value = null
  resellerPrice.value = null
  regularQty.value = 1   // <-- NEW
  errorMsg.value = ''
}

// ─── Dispense ───────────────────────────────────────────────────
const dispense = async () => {
  if (!selectedGallon.value || !selectedType.value) return

  if (selectedType.value === 'reseller') {
    if (!resellerQty.value || !resellerPrice.value) {
      errorMsg.value = 'Please fill in quantity and price.'
      return
    }
  }

  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return

  loading.value = true
  errorMsg.value = ''

  const isReseller = selectedType.value === 'reseller'
  const qty = isReseller ? resellerQty.value : regularQty.value   // <-- NEW: use regularQty
  const pricePerPiece = isReseller ? resellerPrice.value : selectedGallon.value.price
  const totalAmount = isReseller ? resellerTotal.value : regularTotal.value  // <-- NEW

  const { error } = await client.from('transactions').insert([{
    user_id: userId,
    gallon_type: selectedGallon.value.name,           // now allowed after SQL fix
    gallon_type_id: selectedGallon.value.id,
    quantity: qty,                                    // will be >1 for regular bulk
    price_per_piece: pricePerPiece,
    total_amount: totalAmount,
    status: 'completed',
    transaction_type: selectedType.value,
    reseller_qty: isReseller ? resellerQty.value : null,
    reseller_price: isReseller ? resellerPrice.value : null,
  }] as any)

  if (error) {
    errorMsg.value = error.message
    loading.value = false
    return
  }

  successMsg.value = `✅ ${isReseller ? 'Reseller' : 'Regular'} dispense recorded! ₱${totalAmount.toFixed(2)}`
  loading.value = false
  closeDispenseModal()
  await fetchSales()
}

onMounted(async () => {
  await checkSubscription()
  await fetchGallonTypes()
  await fetchSales()
})
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <!-- Subscription Expired Modal -->
      <Transition name="fade">
        <div v-if="isExpired" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative">
            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">⚠️</span>
            </div>
            <h2 class="text-xl font-black text-gray-800 mb-2">Subscription Expired</h2>
            <p class="text-sm text-slate-500 mb-4">Your subscription has expired. Please contact admin to renew.</p>
            <div class="bg-red-50 rounded-2xl p-4 mb-6 border border-red-100">
              <p class="text-xs text-slate-500">Payment Due</p>
              <p class="font-black text-red-600 text-lg">{{ nextPaymentDate }}</p>
            </div>
            <a href="https://www.facebook.com/ej.fron16" target="_blank"
              class="block w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition">
              Contact Admin to Pay
            </a>
          </div>
        </div>
      </Transition>

      <!-- ─── Transaction Type Modal ─────────────────────── -->
      <Transition name="fade">
        <div v-if="showTypeModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <Transition name="scale">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div class="bg-green-600 px-6 py-5 flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-black text-white">{{ selectedGallon?.name }}</h2>
                  <p class="text-green-100 text-xs mt-0.5">Select transaction type</p>
                </div>
                <button @click="closeDispenseModal" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                  <X :size="16" class="text-white" />
                </button>
              </div>

              <div class="p-6 space-y-3">
                <!-- Regular -->
                <button
                  @click="selectType('regular')"
                  class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-slate-200 hover:border-green-400 hover:bg-green-50/50 transition cursor-pointer text-left"
                >
                  <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <Droplets :size="22" class="text-green-600" />
                  </div>
                  <div>
                    <p class="font-bold text-slate-800">Regular Dispense</p>
                    <p class="text-xs text-slate-400 mt-0.5">Single or multiple units — ₱{{ selectedGallon?.price }} per piece</p>
                  </div>
                </button>

                <!-- Reseller -->
                <button
                  @click="selectType('reseller')"
                  class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 transition cursor-pointer text-left"
                >
                  <div class="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <Users :size="22" class="text-violet-600" />
                  </div>
                  <div>
                    <p class="font-bold text-slate-800">Retailer / Reseller</p>
                    <p class="text-xs text-slate-400 mt-0.5">Bulk order — set custom quantity and price</p>
                  </div>
                </button>
              </div>
            </div>
          </Transition>
          <div class="absolute inset-0 -z-10" @click="closeDispenseModal" />
        </div>
      </Transition>

      <!-- ─── Dispense Modal ─────────────────────────────── -->
      <Transition name="fade">
        <div v-if="showDispenseModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <Transition name="scale">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

              <!-- Header -->
              <div :class="['px-6 py-5 flex items-center justify-between', selectedType === 'reseller' ? 'bg-violet-600' : 'bg-green-600']">
                <div>
                  <h2 class="text-lg font-black text-white">
                    {{ selectedType === 'reseller' ? 'Retailer / Reseller' : 'Regular Dispense' }}
                  </h2>
                  <p class="text-white/70 text-xs mt-0.5">{{ selectedGallon?.name }}</p>
                </div>
                <button @click="closeDispenseModal" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                  <X :size="16" class="text-white" />
                </button>
              </div>

              <div class="p-6">

                <!-- Regular summary + quantity input -->
                <div v-if="selectedType === 'regular'" class="mb-6 space-y-4">
                  <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center overflow-hidden shrink-0">
                        <img v-if="selectedGallon?.image_url" :src="selectedGallon.image_url" class="w-full h-full object-cover" />
                        <Droplets v-else :size="20" class="text-green-600" />
                      </div>
                      <div>
                        <p class="font-bold text-slate-800">{{ selectedGallon?.name }}</p>
                        <p class="text-xs text-slate-400">{{ selectedGallon?.size }} {{ selectedGallon?.unit }}</p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between pt-3 border-t border-slate-200">
                      <span class="text-sm text-slate-500">Price per piece</span>
                      <span class="font-black text-green-600 text-lg">₱{{ selectedGallon?.price.toFixed(2) }}</span>
                    </div>
                  </div>

                  <!-- Quantity input for regular -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Gallons
                    </label>
                    <input
                      v-model.number="regularQty"
                      type="number"
                      min="1"
                      placeholder="e.g. 3"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                  </div>

                  <!-- Regular total preview -->
                  <div v-if="regularQty" class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-slate-500">{{ regularQty }} × ₱{{ selectedGallon?.price }}</span>
                      <span class="font-black text-green-600 text-lg">₱{{ regularTotal.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Reseller form (unchanged) -->
                <div v-else class="space-y-4 mb-6">
                  <div class="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                    <p class="text-xs font-semibold text-violet-600 mb-1">{{ selectedGallon?.name }}</p>
                    <p class="text-xs text-slate-400">Regular price: ₱{{ selectedGallon?.price }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Gallons <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model.number="resellerQty"
                      type="number"
                      min="1"
                      placeholder="e.g. 12"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Price per Gallon <span class="text-red-400">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                      <input
                        v-model.number="resellerPrice"
                        type="number"
                        min="1"
                        placeholder="e.g. 20"
                        class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                      >
                    </div>
                  </div>

                  <!-- Total preview -->
                  <div v-if="resellerQty && resellerPrice" class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-slate-500">{{ resellerQty }} × ₱{{ resellerPrice }}</span>
                      <span class="font-black text-violet-600 text-lg">₱{{ resellerTotal.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Error -->
                <div v-if="errorMsg" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                  {{ errorMsg }}
                </div>

                <!-- Dispense Button -->
                <button
                  @click="dispense"
                  :disabled="loading"
                  :class="[
                    'w-full py-4 rounded-2xl font-black text-sm text-white transition cursor-pointer disabled:opacity-50',
                    selectedType === 'reseller'
                      ? 'bg-violet-600 hover:bg-violet-700'
                      : 'bg-green-600 hover:bg-green-700'
                  ]"
                >
                  {{ loading ? 'Recording...' : `Confirm Dispense` }}
                </button>
              </div>
            </div>
          </Transition>
          <div class="absolute inset-0 -z-10" @click="closeDispenseModal" />
        </div>
      </Transition>

      <!-- ─── Create Gallon Modal ────────────────────────── -->
      <Transition name="fade">
        <div v-if="showCreateModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <Transition name="scale">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">

              <div class="bg-green-600 px-6 py-5 flex items-center justify-between sticky top-0">
                <div>
                  <h2 class="text-lg font-black text-white">Create Gallon Type</h2>
                  <p class="text-green-100 text-xs mt-0.5">Add a new product to your station</p>
                </div>
                <button @click="showCreateModal = false" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                  <X :size="16" class="text-white" />
                </button>
              </div>

              <div class="p-6 space-y-4">

                <!-- Image Upload -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
                  <div
                    class="relative w-full h-36 rounded-2xl border-2 border-dashed border-slate-200 hover:border-green-400 transition cursor-pointer overflow-hidden flex items-center justify-center bg-slate-50"
                    @click="($refs.imageInput as HTMLInputElement)?.click()"
                  >
                    <img v-if="newImagePreview" :src="newImagePreview" class="absolute inset-0 w-full h-full object-cover" />
                    <div v-else class="flex flex-col items-center gap-2 text-slate-400">
                      <ImagePlus :size="28" />
                      <p class="text-xs">Click to upload image</p>
                    </div>
                    <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageSelect" />
                  </div>
                </div>

                <!-- Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Gallon Name <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="newName"
                    type="text"
                    placeholder="e.g. Round 5 Gallon, Slim 2.5 Gallon"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                </div>

                <!-- Size + Unit -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Size <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model.number="newSize"
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="e.g. 5"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                    <select
                      v-model="newUnit"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      <option value="gallon">Gallon</option>
                      <option value="liter">Liter</option>
                      <option value="ml">mL</option>
                    </select>
                  </div>
                </div>

                <!-- Price -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Regular Price <span class="text-red-400">*</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                    <input
                      v-model.number="newPrice"
                      type="number"
                      min="1"
                      placeholder="e.g. 30"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                  </div>
                </div>

                <!-- Error -->
                <div v-if="createError" class="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                  {{ createError }}
                </div>

                <!-- Buttons -->
                <div class="flex gap-3 pt-2">
                  <button
                    @click="createGallonType"
                    :disabled="creating"
                    class="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer"
                  >
                    {{ creating ? 'Creating...' : 'Create Gallon' }}
                  </button>
                  <button
                    @click="showCreateModal = false"
                    class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </Transition>
          <div class="absolute inset-0 -z-10" @click="showCreateModal = false" />
        </div>
      </Transition>

      <!-- ─── Main Content ───────────────────────────────── -->
      <div class="p-4 sm:p-8 space-y-6 sm:space-y-8">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Dispense Water</h2>
            <p class="text-slate-500 text-xs sm:text-sm mt-1">Manage your gallon types and dispense</p>
          </div>
          <button
            @click="showCreateModal = true"
            class="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm transition cursor-pointer"
          >
            <Plus :size="16" />
            Add Gallon Type
          </button>
        </div>

        <!-- Warning banner -->
        <div v-if="!isExpired && daysRemaining <= 7 && daysRemaining > 0"
          class="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p class="font-bold text-yellow-700 text-sm">⚠️ Subscription Expiring Soon</p>
            <p class="text-xs text-yellow-600 mt-1">Expires in {{ daysRemaining }} day(s) — {{ nextPaymentDate }}</p>
          </div>
          <a href="https://www.facebook.com/ej.fron16" target="_blank"
            class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition w-full sm:w-auto text-center">
            Pay Now
          </a>
        </div>

        <!-- Sales Stats -->
        <SalesStats
          :today="stats.today"
          :yesterday="stats.yesterday"
          :this-month="stats.thisMonth"
          :this-year="stats.thisYear"
        />

        <!-- Success message -->
        <Transition name="fade">
          <div v-if="successMsg" class="px-5 py-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-semibold flex items-center gap-2">
            <CheckCircle :size="16" />
            {{ successMsg }}
          </div>
        </Transition>

        <!-- Empty state -->
        <div v-if="gallonTypes.length === 0"
          class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <div class="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Droplets :size="28" class="text-green-600" />
          </div>
          <h3 class="font-bold text-slate-700 text-lg mb-2">No gallon types yet</h3>
          <p class="text-slate-400 text-sm mb-6">Create your first gallon type to start dispensing</p>
          <button
            @click="showCreateModal = true"
            class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm transition cursor-pointer"
          >
            <Plus :size="14" class="inline mr-1" />
            Create First Gallon
          </button>
        </div>

        <!-- Gallon Type Cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div
            v-for="g in gallonTypes"
            :key="g.id"
            class="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <!-- Top accent -->
            <div class="absolute top-0 left-0 w-full h-0.5 bg-green-600" />

            <!-- Delete button -->
            <button
              @click.stop="deleteGallonType(g.id)"
              :disabled="deletingId === g.id"
              class="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-white/80 hover:bg-red-50 border border-slate-200 hover:border-red-200 flex items-center justify-center cursor-pointer transition opacity-0 group-hover:opacity-100"
            >
              <Trash2 :size="14" :class="deletingId === g.id ? 'text-slate-300' : 'text-slate-400 hover:text-red-500'" />
            </button>

            <!-- Image -->
            <div class="h-32 bg-linear-to-br from-green-50 to-slate-50 flex items-center justify-center overflow-hidden">
              <img v-if="g.image_url" :src="g.image_url" :alt="g.name" class="h-full w-full object-cover" />
              <div v-else class="flex flex-col items-center gap-2 text-slate-300">
                <Droplets :size="36" />
              </div>
            </div>

            <!-- Content -->
            <div class="p-5">
              <h3 class="font-bold text-slate-800 text-base mb-0.5">{{ g.name }}</h3>
              <p class="text-xs text-slate-400 mb-4">{{ g.size }} {{ g.unit }}</p>

              <!-- Price badges -->
              <div class="flex items-center gap-2 mb-5">
                <span class="px-3 py-1.5 rounded-xl bg-green-100 text-green-700 text-xs font-bold">
                  Regular ₱{{ g.price }}
                </span>
                <span class="px-3 py-1.5 rounded-xl bg-violet-100 text-violet-700 text-xs font-bold">
                  Reseller
                </span>
              </div>

              <!-- Dispense Button -->
              <button
                @click="openDispense(g)"
                :disabled="isExpired"
                class="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingCart :size="15" />
                Dispense
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active, .scale-leave-active { transition: all 0.2s ease; }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.95); }
</style>