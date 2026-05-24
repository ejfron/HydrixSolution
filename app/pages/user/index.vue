<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient } from '#imports'
import { PhilippinePeso, Droplets, TrendingUp, ReceiptText } from '@lucide/vue'
import Navbar from '~/components/user/Navbar.vue'
import Sidebar from '~/components/user/Sidebar.vue'

type Transaction = {
  id: string
  gallon_type: string
  quantity: number
  total_amount: number
  status: string
  created_at: string
}

const client = useSupabaseClient()
const user = useSupabaseUser()

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

const formatDate = (d: string) =>
  new Date(d).toLocaleString('en-PH', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

onMounted(() => fetchDashboard())
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <div class="p-8 space-y-8">

        <!-- Stats -->
        <section class="grid grid-cols-4 gap-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between">
            <div>
              <p class="text-slate-500 mb-2 text-sm">Today's Sales</p>
              <h2 class="text-xl font-bold text-gray-700">₱{{ stats.today.toFixed(2) }}</h2>
            </div>
            <div class="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
              <PhilippinePeso class="text-white" :size="26" />
            </div>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between">
            <div>
              <p class="text-slate-500 mb-2 text-sm">This Month</p>
              <h2 class="text-xl font-bold text-gray-700">₱{{ stats.thisMonth.toFixed(2) }}</h2>
            </div>
            <div class="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center">
              <TrendingUp class="text-white" :size="26" />
            </div>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between">
            <div>
              <p class="text-slate-500 mb-2 text-sm">Total Sales</p>
              <h2 class="text-xl font-bold text-gray-700">₱{{ stats.totalSales.toFixed(2) }}</h2>
            </div>
            <div class="w-14 h-14 rounded-full bg-violet-500 flex items-center justify-center">
              <Droplets class="text-white" :size="26" />
            </div>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between">
            <div>
              <p class="text-slate-500 mb-2 text-sm">Transactions</p>
              <h2 class="text-xl font-bold text-gray-700">{{ stats.totalTransactions }}</h2>
            </div>
            <div class="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center">
              <ReceiptText class="text-white" :size="26" />
            </div>
          </div>
        </section>
      

        <!-- Recent Transactions -->
        <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div class="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
            <h2 class="font-bold text-green-600">RECENT TRANSACTIONS</h2>
            <NuxtLink to="/user/Transactionpage" class="text-sm text-green-600 font-semibold hover:underline">
              View All
            </NuxtLink>
          </div>

          <div v-if="recentTransactions.length === 0" class="p-10 text-center text-slate-400 text-sm">
            No transactions yet.
            <NuxtLink to="/user/Dispense" class="text-green-600 font-semibold hover:underline ml-1">
              Start dispensing
            </NuxtLink>
          </div>

          <table v-else class="w-full">
            <thead class="bg-slate-50">
              <tr class="text-gray-600 text-xs">
                <th class="text-left px-8 py-5">Date & Time</th>
                <th class="text-left px-8 py-5">Gallon Type</th>
                <th class="text-left px-8 py-5">Qty</th>
                <th class="text-left px-8 py-5">Total</th>
                <th class="text-left px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="t in recentTransactions"
                :key="t.id"
                class="border-b border-slate-100 text-gray-700 text-xs"
              >
                <td class="px-8 py-5">{{ formatDate(t.created_at) }}</td>
                <td class="px-8 py-5 font-semibold">{{ t.gallon_type }}</td>
                <td class="px-8 py-5">{{ t.quantity }} pcs</td>
                <td class="px-8 py-5 font-bold text-green-600">₱{{ Number(t.total_amount).toFixed(2) }}</td>
                <td class="px-8 py-5">
                  <span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    {{ t.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </main>
  </div>
</template>