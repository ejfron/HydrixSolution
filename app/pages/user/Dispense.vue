<script setup lang="ts">

definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient } from '#imports'
import { Droplets, Plus, Minus, ShoppingCart, CheckCircle } from '@lucide/vue'
import Navbar from '~/components/user/Navbar.vue'
import Sidebar from '~/components/user/Sidebar.vue'


const client = useSupabaseClient()
const user = useSupabaseUser()

type GallonId = '1gal' | '2.5gal' | '5gal'

const gallonTypes: { id: GallonId; label: string; price: number; icon: Component  }[] = [
  { id: '1gal',   label: '1 Gallon',   price: 10, icon: Droplets },
  { id: '2.5gal', label: '2.5 Gallon', price: 20, icon: Droplets },
  { id: '5gal',   label: '5 Gallon',   price: 30, icon: Droplets },
]

const quantities = ref<Record<GallonId, number>>({
  '1gal': 0,
  '2.5gal': 0,
  '5gal': 0,
})

const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const totalAmount = computed(() =>
  gallonTypes.reduce((sum, g) => sum + (quantities.value[g.id] * g.price), 0)
)

const totalGallons = computed(() =>
  (Object.values(quantities.value) as number[]).reduce((sum, q) => sum + q, 0)
)

const increment = (id: GallonId) => quantities.value[id]++
const decrement = (id: GallonId) => {
  if (quantities.value[id] > 0) quantities.value[id]--
}

const resetAll = () => {
  quantities.value = { '1gal': 0, '2.5gal': 0, '5gal': 0 }
}

const dispense = async () => {
  if (totalGallons.value === 0) {
    errorMsg.value = 'Please select at least one gallon.'
    return
  }

  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id

  if (!userId) return

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const inserts = gallonTypes
    .filter(g => quantities.value[g.id] > 0)
    .map(g => ({
      user_id: userId,
      gallon_type: g.id,
      quantity: quantities.value[g.id],
      price_per_piece: g.price,
      total_amount: quantities.value[g.id] * g.price,
      status: 'completed',
    }))

  const { error } = await client.from('transactions').insert(inserts as any)

  if (error) {
    errorMsg.value = error.message
    loading.value = false
    return
  }

  successMsg.value = `✅ Dispensed! Total: ₱${totalAmount.value.toFixed(2)}`
  resetAll()
  loading.value = false
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <div class="p-8 space-y-8">

        <div>
          <h2 class="text-2xl font-bold text-gray-700">Dispense Water</h2>
          <p class="text-slate-500 text-sm mt-1">Select gallon type and quantity to dispense</p>
        </div>

        <!-- Gallon Cards -->
        <div class="grid grid-cols-3 gap-6">
          <div
            v-for="g in gallonTypes"
            :key="g.id"
            class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
          >
            <div class="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4 mx-auto">
                <component :is="g.icon" class="text-green-600" :size="28" />
            </div>
            <h3 class="text-center text-2xl font-bold text-gray-700 mb-1">{{ g.label }}</h3>
        

            <!-- Quantity Control -->
            <div class="flex items-center justify-center gap-4">
              <button
                @click="decrement(g.id)"
                class="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
              >
                <Minus :size="16" class="text-gray-600" />
              </button>

              <span class="text-2xl font-bold text-gray-700 w-10 text-center">
                {{ quantities[g.id] }}
              </span>

              <button
                @click="increment(g.id)"
                class="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center cursor-pointer transition"
              >
                <Plus :size="16" class="text-white" />
              </button>
            </div>

            <!-- Subtotal -->
            <div class="mt-4 text-center text-sm text-slate-500">
              Subtotal:
              <span class="font-bold text-gray-700">
                ₱{{ (quantities[g.id] * g.price).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 class="font-bold text-gray-700 text-lg mb-4 flex items-center gap-2">
            <ShoppingCart :size="20" class="text-green-600" />
            Order Summary
          </h3>

          <div class="space-y-3 mb-6">
            <div
              v-for="g in gallonTypes.filter(g => quantities[g.id] > 0)"
              :key="g.id"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-slate-500">{{ g.label }} × {{ quantities[g.id] }}</span>
              <span class="font-semibold text-gray-700">₱{{ (quantities[g.id] * g.price).toFixed(2) }}</span>
            </div>

            <div v-if="totalGallons === 0" class="text-slate-400 text-sm text-center py-2">
              No items selected
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4 flex items-center justify-between">
            <div>
              <p class="text-slate-500 text-sm">Total Gallons: <span class="font-bold text-gray-700">{{ totalGallons }}</span></p>
              <p class="text-xl font-black text-green-600 mt-1">Total: ₱{{ totalAmount.toFixed(2) }}</p>
            </div>

            <div class="flex gap-3">
              <button
                @click="resetAll"
                class="px-6 py-3 rounded-2xl border border-slate-200 text-gray-600 hover:bg-slate-50 font-semibold text-sm transition cursor-pointer"
              >
                Reset
              </button>

              <button
                @click="dispense"
                :disabled="loading || totalGallons === 0"
                class="px-8 py-3 rounded-2xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition cursor-pointer"
              >
                {{ loading ? 'Processing...' : 'Dispense' }}
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div v-if="successMsg" class="mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-sm flex items-center gap-2">
            <CheckCircle :size="16" />
            {{ successMsg }}
          </div>
          <div v-if="errorMsg" class="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
            {{ errorMsg }}
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<!-- 980907 -->