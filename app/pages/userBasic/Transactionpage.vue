<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient } from '#imports'
import { RefreshCw, Bike, LayoutGrid } from '@lucide/vue'
import Navbar from '~/components/userBasic/Navbar.vue'
import Sidebar from '~/components/userBasic/Sidebar.vue'

const client = useSupabaseClient()
const user = useSupabaseUser()

type Transaction = {
  id: string
  gallon_type: string
  quantity: number
  price_per_piece: number
  total_amount: number
  status: string
  transaction_type: string
  reseller_qty: number | null
  reseller_price: number | null
  rider_id: string | null
  rider_name: string | null
  created_at: string
}

type Rider = {
  id: string
  name: string
}

const transactions = ref<Transaction[]>([])
const riders = ref<Rider[]>([])
const loading = ref(true)
const activeTab = ref<string>('all')

const getUserId = async () => {
  const { data: { session } } = await client.auth.getSession()
  return user.value?.id ?? session?.user?.id
}

const fetchAll = async () => {
  loading.value = true
  const userId = await getUserId()
  if (!userId) return

  // Fetch transactions
  const { data: txData } = await client
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<Transaction[]>()

  if (txData) transactions.value = txData

  // Fetch riders for tabs
  const { data: riderData } = await (client.from('delivery_riders') as any)
    .select('id, name')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (riderData) riders.value = riderData

  loading.value = false
}

// Filtered transactions based on active tab
const filteredTransactions = computed(() => {
  if (activeTab.value === 'all') return transactions.value
  if (activeTab.value === 'unassigned') return transactions.value.filter(t => !t.rider_id)
  return transactions.value.filter(t => t.rider_id === activeTab.value)
})

// Tab totals
const getTabTotal = (tabId: string) => {
  const txs = tabId === 'all'
    ? transactions.value
    : tabId === 'unassigned'
      ? transactions.value.filter(t => !t.rider_id)
      : transactions.value.filter(t => t.rider_id === tabId)

  return txs.reduce((s, t) => s + Number(t.total_amount), 0)
}

const getTabCount = (tabId: string) => {
  if (tabId === 'all') return transactions.value.length
  if (tabId === 'unassigned') return transactions.value.filter(t => !t.rider_id).length
  return transactions.value.filter(t => t.rider_id === tabId).length
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

const formatPeso = (n: number) =>
  `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

onMounted(() => fetchAll())
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <div class="p-4 sm:p-8 space-y-6">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Transactions</h2>
            <p class="text-slate-500 text-xs sm:text-sm mt-1">All dispense records sorted by rider</p>
          </div>
          <button @click="fetchAll"
            class="flex items-center gap-2 px-4 py-2.5 border border-green-200 text-green-600 hover:bg-green-50 rounded-2xl text-sm font-semibold transition cursor-pointer">
            <RefreshCw :size="14" />
            Refresh
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <!-- All tab -->
          <button
            @click="activeTab = 'all'"
            :class="[
              'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition cursor-pointer shrink-0',
              activeTab === 'all'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            ]"
          >
            <LayoutGrid :size="14" />
            All Transactions
            <span :class="['px-2 py-0.5 rounded-lg text-[11px] font-bold',
              activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600']">
              {{ getTabCount('all') }}
            </span>
          </button>

          <!-- Rider tabs -->
          <button
            v-for="rider in riders"
            :key="rider.id"
            @click="activeTab = rider.id"
            :class="[
              'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition cursor-pointer shrink-0',
              activeTab === rider.id
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            ]"
          >
            <Bike :size="14" />
            {{ rider.name }}
            <span :class="['px-2 py-0.5 rounded-lg text-[11px] font-bold',
              activeTab === rider.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600']">
              {{ getTabCount(rider.id) }}
            </span>
          </button>

          <!-- Unassigned tab -->
          <button
            v-if="transactions.some(t => !t.rider_id)"
            @click="activeTab = 'unassigned'"
            :class="[
              'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition cursor-pointer shrink-0',
              activeTab === 'unassigned'
                ? 'bg-slate-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            ]"
          >
            No Rider
            <span :class="['px-2 py-0.5 rounded-lg text-[11px] font-bold',
              activeTab === 'unassigned' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600']">
              {{ getTabCount('unassigned') }}
            </span>
          </button>
        </div>

        <!-- Tab Summary Card -->
        <div class="bg-white rounded-2xl border border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400">
              {{ activeTab === 'all' ? 'Total Revenue' :
                 activeTab === 'unassigned' ? 'Unassigned Revenue' :
                 `${riders.find(r => r.id === activeTab)?.name}'s Revenue` }}
            </p>
            <p class="text-xl font-black text-green-600 mt-0.5">{{ formatPeso(getTabTotal(activeTab)) }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-slate-400">Transactions</p>
            <p class="text-xl font-black text-slate-700 mt-0.5">{{ getTabCount(activeTab) }}</p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-16 text-slate-400 text-sm">Loading...</div>

        <!-- Empty -->
        <div v-else-if="filteredTransactions.length === 0"
          class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <p class="text-slate-400 text-sm">No transactions found for this filter.</p>
        </div>

        <!-- Table — desktop -->
        <div v-else class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">

          <div class="hidden sm:block overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Gallon Type</th>
                  <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Type</th>
                  <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Qty</th>
                  <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Price</th>
                  <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Total</th>
                  <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Rider</th>
                  <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="tx in filteredTransactions" :key="tx.id" class="hover:bg-slate-50/50 transition">
                  <td class="px-6 py-4 text-sm font-medium text-slate-700">{{ tx.gallon_type }}</td>
                  <td class="px-6 py-4">
                    <span :class="['px-2.5 py-1 rounded-lg text-[11px] font-semibold',
                      tx.transaction_type === 'reseller'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-green-100 text-green-700']">
                      {{ tx.transaction_type === 'reseller' ? 'Reseller' : 'Regular' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-600">{{ tx.quantity }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600">{{ formatPeso(tx.price_per_piece) }}</td>
                  <td class="px-6 py-4 text-sm font-bold text-green-600">{{ formatPeso(tx.total_amount) }}</td>
                  <td class="px-6 py-4">
                    <span v-if="tx.rider_name" class="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <div class="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-black text-[10px]">
                        {{ tx.rider_name.charAt(0) }}
                      </div>
                      {{ tx.rider_name }}
                    </span>
                    <span v-else class="text-xs text-slate-300">—</span>
                  </td>
                  <td class="px-6 py-4 text-xs text-slate-400">{{ formatDate(tx.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile cards -->
          <div class="sm:hidden divide-y divide-slate-100">
            <div v-for="tx in filteredTransactions" :key="tx.id" class="p-4 space-y-2">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-bold text-slate-800">{{ tx.gallon_type }}</p>
                  <p class="text-xs text-slate-400">{{ formatDate(tx.created_at) }}</p>
                </div>
                <p class="font-black text-green-600">{{ formatPeso(tx.total_amount) }}</p>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <span :class="['px-2 py-0.5 rounded-lg text-[11px] font-semibold',
                  tx.transaction_type === 'reseller' ? 'bg-violet-100 text-violet-700' : 'bg-green-100 text-green-700']">
                  {{ tx.transaction_type === 'reseller' ? 'Reseller' : 'Regular' }}
                </span>
                <span class="text-xs text-slate-500">Qty: {{ tx.quantity }}</span>
                <span v-if="tx.rider_name" class="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <Bike :size="11" /> {{ tx.rider_name }}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>