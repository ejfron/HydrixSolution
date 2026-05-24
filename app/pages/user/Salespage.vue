<script setup lang="ts">

definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient } from '#imports'
import { PhilippinePeso, Droplets, TrendingUp, Calendar } from '@lucide/vue'
import Navbar from '~/components/user/Navbar.vue'
import Sidebar from '~/components/user/Sidebar.vue'

type Transaction = {
  gallon_type: string
  quantity: number
  total_amount: number
  created_at: string
}

type GallonBreakdown = {
  '1gal': { quantity: number; amount: number }
  '2.5gal': { quantity: number; amount: number }
  '5gal': { quantity: number; amount: number }
}

const client = useSupabaseClient()
const user = useSupabaseUser()

const stats = ref({ today: 0, yesterday: 0, thisMonth: 0, thisYear: 0, totalGallons: 0 })

const gallon_breakdown = ref<GallonBreakdown>({
  '1gal': { quantity: 0, amount: 0 },
  '2.5gal': { quantity: 0, amount: 0 },
  '5gal': { quantity: 0, amount: 0 },
})

const fetchSales = async () => {
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return

  const { data } = await client
    .from('transactions')
    .select('gallon_type, quantity, total_amount, created_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .returns<Transaction[]>()

  if (!data) return

  const now = new Date()
  const todayStr = now.toDateString()
  const yesterdayStr = new Date(now.getTime() - 86400000).toDateString()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  let today = 0, yesterday = 0, month = 0, year = 0, gallons = 0
  const breakdown: GallonBreakdown = {
    '1gal': { quantity: 0, amount: 0 },
    '2.5gal': { quantity: 0, amount: 0 },
    '5gal': { quantity: 0, amount: 0 },
  }

  for (const t of data) {
    const d = new Date(t.created_at)
    const amt = Number(t.total_amount)
    const qty = Number(t.quantity)

    if (d.toDateString() === todayStr) today += amt
    if (d.toDateString() === yesterdayStr) yesterday += amt
    if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) month += amt
    if (d.getFullYear() === thisYear) year += amt

    gallons += qty

    const key = t.gallon_type as keyof GallonBreakdown
    if (breakdown[key]) {
      breakdown[key].quantity += qty
      breakdown[key].amount += amt
    }
  }

  stats.value = { today, yesterday, thisMonth: month, thisYear: year, totalGallons: gallons }
  gallon_breakdown.value = breakdown
}

onMounted(() => fetchSales())
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <div class="p-8 space-y-8">

        <div>
          <h2 class="text-2xl font-bold text-gray-700">Sales Overview</h2>
          <p class="text-slate-500 text-sm mt-1">Your station's sales summary</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-4 gap-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-6">
            <p class="text-slate-500 text-sm mb-2 flex items-center gap-2">
              <Calendar :size="14" /> Today
            </p>
            <h2 class="text-2xl font-black text-green-600">₱{{ stats.today.toFixed(2) }}</h2>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200 p-6">
            <p class="text-slate-500 text-sm mb-2 flex items-center gap-2">
              <Calendar :size="14" /> Yesterday
            </p>
            <h2 class="text-2xl font-black text-blue-600">₱{{ stats.yesterday.toFixed(2) }}</h2>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200 p-6">
            <p class="text-slate-500 text-sm mb-2 flex items-center gap-2">
              <TrendingUp :size="14" /> This Month
            </p>
            <h2 class="text-2xl font-black text-violet-600">₱{{ stats.thisMonth.toFixed(2) }}</h2>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200 p-6">
            <p class="text-slate-500 text-sm mb-2 flex items-center gap-2">
              <PhilippinePeso :size="14" /> This Year
            </p>
            <h2 class="text-2xl font-black text-yellow-500">₱{{ stats.thisYear.toFixed(2) }}</h2>
          </div>
        </div>

        <!-- Gallon Breakdown -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6">
          <h3 class="font-bold text-gray-700 text-lg mb-6 flex items-center gap-2">
            <Droplets :size="20" class="text-green-600" />
            Gallon Type Breakdown
          </h3>

          <div class="grid grid-cols-3 gap-6">
            <div
              v-for="(val, key) in gallon_breakdown"
              :key="key"
              class="rounded-2xl bg-slate-50 border border-slate-100 p-5 text-center"
            >
              <p class="text-slate-500 text-sm mb-2">{{ key }}</p>
              <h3 class="text-2xl font-black text-gray-700">{{ val.quantity }}</h3>
              <p class="text-xs text-slate-400 mt-1">pieces sold</p>
              <p class="text-green-600 font-bold mt-2">₱{{ val.amount.toFixed(2) }}</p>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <p class="text-slate-500 text-sm">Total Gallons Dispensed</p>
            <p class="font-black text-gray-700 text-lg">{{ stats.totalGallons }} pieces</p>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>