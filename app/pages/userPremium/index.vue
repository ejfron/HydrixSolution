<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient } from '#imports'
import { PhilippinePeso, Droplets, TrendingUp, ReceiptText } from '@lucide/vue'
import Navbar from '~/components/userPremium/Navbar.vue'
import Sidebar from '~/components/userPremium/Sidebar.vue'
import { useSubscription } from '~/composables/useSubscription'

type Transaction = {
  id: string
  gallon_type: string
  quantity: number
  total_amount: number
  status: string
  transaction_type: string
  created_at: string
}

const client = useSupabaseClient()
const user = useSupabaseUser()
const { isExpired, daysRemaining, nextPaymentDate, checkSubscription } = useSubscription()

const stats = ref({ today: 0, thisMonth: 0, totalSales: 0, totalTransactions: 0 })
const recentTransactions = ref<Transaction[]>([])

const fetchDashboard = async () => {
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return

  const { data } = await client
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .returns<Transaction[]>()

  if (!data) return

  recentTransactions.value = data.slice(0, 5)

  const now = new Date()
  let today = 0, month = 0, total = 0

  for (const t of data) {
    const d = new Date(t.created_at)
    const amt = Number(t.total_amount)
    total += amt
    if (d.toDateString() === now.toDateString()) today += amt
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) month += amt
  }

  stats.value = { today, thisMonth: month, totalSales: total, totalTransactions: data.length }
}

// ─── Helper for transaction type badge ────────────
const typeLabel = (type: string) => {
  if (type === 'reseller') return 'Retailer/Reseller'
  return 'Regular'
}

const typeBadgeColor = (type: string) => {
  if (type === 'reseller') return 'bg-violet-100 text-violet-700'
  return 'bg-green-100 text-green-700'
}

const formatDate = (d: string) =>
  new Date(d).toLocaleString('en-PH', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

onMounted(async () => {
  await checkSubscription()
  await fetchDashboard()
})
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <!-- Responsive container padding -->
      <div class="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">

        <!-- Warning banners: responsive stacking -->
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

        <div
          v-if="isExpired"
          class="bg-red-50 border border-red-200 rounded-2xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div>
            <p class="font-bold text-red-600 text-sm">Subscription Expired</p>
            <p class="text-xs text-red-500 mt-1">
              Your subscription expired on {{ nextPaymentDate }}. Contact admin to renew.
            </p>
          </div>
          
          <a href="https://www.facebook.com/ej.fron16"
            target="_blank"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition cursor-pointer w-full sm:w-auto text-center"
          >
            Contact Admin
          </a>
        </div>

        <!-- Stats Cards: responsive grid -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <!-- Today's Sales -->
          <div class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p class="text-slate-500 mb-1 sm:mb-2 text-xs sm:text-sm">Today's Sales</p>
              <h2 class="text-base sm:text-xl font-bold text-gray-700">₱{{ stats.today.toFixed(2) }}</h2>
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-green-500 flex items-center justify-center">
              <PhilippinePeso class="text-white" :size="18" />
            </div>
          </div>

          <!-- This Month -->
          <div class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p class="text-slate-500 mb-1 sm:mb-2 text-xs sm:text-sm">This Month</p>
              <h2 class="text-base sm:text-xl font-bold text-gray-700">₱{{ stats.thisMonth.toFixed(2) }}</h2>
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-blue-500 flex items-center justify-center">
              <TrendingUp class="text-white" :size="18" />
            </div>
          </div>

          <!-- Total Sales -->
          <div class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p class="text-slate-500 mb-1 sm:mb-2 text-xs sm:text-sm">Total Sales</p>
              <h2 class="text-base sm:text-xl font-bold text-gray-700">₱{{ stats.totalSales.toFixed(2) }}</h2>
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-violet-500 flex items-center justify-center">
              <Droplets class="text-white" :size="18" />
            </div>
          </div>

          <!-- Transactions -->
          <div class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p class="text-slate-500 mb-1 sm:mb-2 text-xs sm:text-sm">Transactions</p>
              <h2 class="text-base sm:text-xl font-bold text-gray-700">{{ stats.totalTransactions }}</h2>
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-yellow-500 flex items-center justify-center">
              <ReceiptText class="text-white" :size="18" />
            </div>
          </div>
        </section>

        <!-- Recent Transactions Table: responsive with horizontal scroll -->
        <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div class="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200 flex items-center justify-between">
            <h2 class="font-bold text-green-600 text-sm sm:text-base">RECENT TRANSACTIONS</h2>
            <NuxtLink to="/user/Transactionpage" class="text-xs sm:text-sm text-green-600 font-semibold hover:underline">
              View All
            </NuxtLink>
          </div>

          <div v-if="recentTransactions.length === 0" class="p-6 sm:p-10 text-center text-slate-400 text-xs sm:text-sm">
            No transactions yet.
            <NuxtLink to="/user/Dispense" class="text-green-600 font-semibold hover:underline ml-1">
              Start dispensing
            </NuxtLink>
          </div>

          <!-- Table wrapper for horizontal scroll on mobile -->
          <div v-else class="overflow-x-auto">
            <table class="w-full min-w-150">
              <thead class="bg-slate-50">
                <tr class="text-gray-600 text-xs">
                  <th class="text-left px-4 sm:px-6 lg:px-8 py-4 sm:py-5">Date & Time</th>
                  <th class="text-left px-4 sm:px-6 lg:px-8 py-4 sm:py-5">Type</th>
                  <th class="text-left px-4 sm:px-6 lg:px-8 py-4 sm:py-5">Gallon Type</th>
                  <th class="text-left px-4 sm:px-6 lg:px-8 py-4 sm:py-5">Qty</th>
                  <th class="text-left px-4 sm:px-6 lg:px-8 py-4 sm:py-5">Total</th>
                  <th class="text-left px-4 sm:px-6 lg:px-8 py-4 sm:py-5">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="t in recentTransactions"
                  :key="t.id"
                  class="border-b border-slate-100 text-gray-700 text-xs"
                >
                  <td class="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 whitespace-nowrap">{{ formatDate(t.created_at) }}</td>
                   <td class="px-8 py-5">
                  <span :class="['px-2 py-1 rounded-full text-xs font-semibold', typeBadgeColor(t.transaction_type)]">
                    {{ typeLabel(t.transaction_type) }}
                  </span>
                </td>
                  <td class="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 font-semibold whitespace-nowrap">{{ t.gallon_type }}</td>
                  <td class="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">{{ t.quantity }} pcs</td>
                  <td class="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 font-bold text-green-600 whitespace-nowrap">₱{{ Number(t.total_amount).toFixed(2) }}</td>
                  <td class="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                    <span class="px-2 sm:px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      {{ t.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>