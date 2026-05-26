<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient } from '#imports'
import { Droplets, X, Plus, Minus, ShoppingCart, CheckCircle } from '@lucide/vue'
import { useRouter } from 'vue-router'
import type { Component } from 'vue'
import Navbar from '~/components/user/Navbar.vue'
import Sidebar from '~/components/user/Sidebar.vue'
import SalesStats from '~/components/user/SalesStats.vue'
import { useSubscription } from '~/composables/useSubscription'

const client = useSupabaseClient()
const user = useSupabaseUser()
const route = useRouter()
const { isExpired, nextPaymentDate, daysRemaining, checkSubscription } = useSubscription()

const stats = ref({ today: 0, yesterday: 0, thisMonth: 0, thisYear: 0, totalGallons: 0 })

type GallonId = '1gal' | '2.5gal' | '5gal'

const gallonTypes: { id: GallonId; label: string; price: number; icon: Component }[] = [
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
  await fetchSales()
}

const Expired = () => {
  isExpired.value = true
  route.push('/user')
}

onMounted(async () => {
  await checkSubscription()
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
        <div
          v-if="isExpired"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative">
            <div class="absolute bg-green-300 p-1 rounded-full top-4 right-4 cursor-pointer" @click="Expired">
              <X :size="20" class="text-gray-700" />
            </div>
            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">⚠️</span>
            </div>
            <h2 class="text-xl font-black text-gray-800 mb-2">Subscription Expired</h2>
            <p class="text-sm text-slate-500 mb-2">
              Your subscription has expired. Please pay your monthly fee to continue using the dispense system.
            </p>
            <div class="bg-red-50 rounded-2xl p-4 mb-6 border border-red-100">
              <p class="text-xs text-slate-500">Payment Due</p>
              <p class="font-black text-red-600 text-lg">{{ nextPaymentDate }}</p>
            </div>
            
            <a href="https://www.facebook.com/ej.fron16"
              target="_blank"
              class="block w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition mb-3"
            >
              Contact Admin to Pay
            </a>
            <p class="text-xs text-slate-400">
              Contact your administrator to process payment and reactivate your account.
            </p>
          </div>
        </div>
      </Transition>

      <!-- Responsive main container: smaller padding on mobile -->
      <div class="p-4 sm:p-8 space-y-6 sm:space-y-8">

        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Dispense Water</h2>
          <p class="text-slate-500 text-xs sm:text-sm mt-1">Select gallon type and quantity to dispense</p>
        </div>

        <!-- 7-day warning banner (already responsive) -->
        <div
          v-if="!isExpired && daysRemaining <= 7 && daysRemaining > 0"
          class="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div>
            <p class="font-bold text-yellow-700 text-sm">⚠️ Subscription Expiring Soon</p>
            <p class="text-xs text-yellow-600 mt-1">
              Your subscription expires in {{ daysRemaining }} day(s) — due {{ nextPaymentDate }}
            </p>
          </div>
          
          <a href="https://www.facebook.com/ej.fron16"
            target="_blank"
            class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition cursor-pointer w-full sm:w-auto text-center"
          >
            Pay Now
          </a>
        </div>

        <!-- Sales Stats (already responsive from previous update) -->
        <SalesStats
          :today="stats.today"
          :yesterday="stats.yesterday"
          :this-month="stats.thisMonth"
          :this-year="stats.thisYear"
        />

        <!-- Gallon Cards: responsive grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div
            v-for="g in gallonTypes"
            :key="g.id"
            class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm"
          >
            <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4 mx-auto">
              <component :is="g.icon" class="text-green-600" :size="24" />
            </div>
            <h3 class="text-center text-xl sm:text-2xl font-bold text-gray-700 mb-1">{{ g.label }}</h3>
            <p class="text-center text-green-600 font-bold text-base sm:text-lg mb-4">₱{{ g.price }} / piece</p>

            <!-- Quantity Control -->
            <div class="flex items-center justify-center gap-3 sm:gap-4">
              <button
                @click="decrement(g.id)"
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
              >
                <Minus :size="14" class="text-gray-600" />
              </button>

              <span class="text-xl sm:text-2xl font-bold text-gray-700 w-8 sm:w-10 text-center">
                {{ quantities[g.id] }}
              </span>

              <button
                @click="increment(g.id)"
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center cursor-pointer transition"
              >
                <Plus :size="14" class="text-white" />
              </button>
            </div>

            <!-- Subtotal -->
            <div class="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-slate-500">
              Subtotal:
              <span class="font-bold text-gray-700">
                ₱{{ (quantities[g.id] * g.price).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Order Summary: responsive column/row layout -->
        <div class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <h3 class="font-bold text-gray-700 text-base sm:text-lg mb-4 flex items-center gap-2">
            <ShoppingCart :size="18" class="text-green-600" />
            Order Summary
          </h3>

          <div class="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            <div
              v-for="g in gallonTypes.filter(g => quantities[g.id] > 0)"
              :key="g.id"
              class="flex items-center justify-between text-xs sm:text-sm"
            >
              <span class="text-slate-500">{{ g.label }} × {{ quantities[g.id] }}</span>
              <span class="font-semibold text-gray-700">₱{{ (quantities[g.id] * g.price).toFixed(2) }}</span>
            </div>

            <div v-if="totalGallons === 0" class="text-slate-400 text-xs sm:text-sm text-center py-2">
              No items selected
            </div>
          </div>

          <!-- Flex: column on mobile, row on larger screens -->
          <div class="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p class="text-slate-500 text-xs sm:text-sm">
                Total Gallons: <span class="font-bold text-gray-700">{{ totalGallons }}</span>
              </p>
              <p class="text-lg sm:text-xl font-black text-green-600 mt-1">Total: ₱{{ totalAmount.toFixed(2) }}</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click="resetAll"
                class="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border border-slate-200 text-gray-600 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition cursor-pointer"
              >
                Reset
              </button>

              <button
                @click="dispense"
                :disabled="loading || totalGallons === 0 || isExpired"
                class="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                {{ loading ? 'Processing...' : 'Dispense' }}
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div v-if="successMsg" class="mt-4 px-3 sm:px-4 py-2.5 sm:py-3 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle :size="14" />
            {{ successMsg }}
          </div>
          <div v-if="errorMsg" class="mt-4 px-3 sm:px-4 py-2.5 sm:py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs sm:text-sm">
            {{ errorMsg }}
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>