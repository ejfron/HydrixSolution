<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient } from '#imports'
import { FileText, TrendingUp, Droplets } from '@lucide/vue'
import Navbar from '~/components/userStandard/Navbar.vue'
import Sidebar from '~/components/userStandard/Sidebar.vue'

type Transaction = {
  total_amount: number
  quantity: number
  created_at: string
}

const client = useSupabaseClient()
const user = useSupabaseUser()

const selectedPeriod = ref<'daily' | 'monthly' | 'yearly'>('daily')
const dailyData = ref<{ date: string; total: number; gallons: number }[]>([])
const monthlyData = ref<{ month: string; total: number; gallons: number }[]>([])
const yearlyData = ref<{ year: string; total: number; gallons: number }[]>([])

const fetchReports = async () => {
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return

  const { data } = await client
    .from('transactions')
    .select('total_amount, quantity, created_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .returns<Transaction[]>()

  if (!data) return

  const dailyMap: Record<string, { total: number; gallons: number }> = {}
  const monthlyMap: Record<string, { total: number; gallons: number }> = {}
  const yearlyMap: Record<string, { total: number; gallons: number }> = {}

  for (const t of data) {
    const d = new Date(t.created_at)
    const dayKey = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    const monthKey = d.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
    const yearKey = String(d.getFullYear())

    if (!dailyMap[dayKey]) dailyMap[dayKey] = { total: 0, gallons: 0 }
    if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { total: 0, gallons: 0 }
    if (!yearlyMap[yearKey]) yearlyMap[yearKey] = { total: 0, gallons: 0 }

    dailyMap[dayKey].total += Number(t.total_amount)
    dailyMap[dayKey].gallons += Number(t.quantity)
    monthlyMap[monthKey].total += Number(t.total_amount)
    monthlyMap[monthKey].gallons += Number(t.quantity)
    yearlyMap[yearKey].total += Number(t.total_amount)
    yearlyMap[yearKey].gallons += Number(t.quantity)
  }

  dailyData.value = Object.entries(dailyMap).slice(0, 7).map(([date, v]) => ({ date, ...v }))
  monthlyData.value = Object.entries(monthlyMap).slice(0, 12).map(([month, v]) => ({ month, ...v }))
  yearlyData.value = Object.entries(yearlyMap).map(([year, v]) => ({ year, ...v }))
}

const currentData = computed(() => {
  if (selectedPeriod.value === 'daily') return dailyData.value.map(d => ({ label: d.date, total: d.total, gallons: d.gallons }))
  if (selectedPeriod.value === 'monthly') return monthlyData.value.map(d => ({ label: d.month, total: d.total, gallons: d.gallons }))
  return yearlyData.value.map(d => ({ label: d.year, total: d.total, gallons: d.gallons }))
})

const grandTotal = computed(() => currentData.value.reduce((s, d) => s + d.total, 0))
const grandGallons = computed(() => currentData.value.reduce((s, d) => s + d.gallons, 0))

onMounted(() => fetchReports())
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <!-- Responsive container: smaller padding on mobile, larger on desktop -->
      <div class="p-4 sm:p-8 space-y-6 sm:space-y-8">

        <!-- Header: column on mobile, row on larger screens -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Reports</h2>
            <p class="text-slate-500 text-xs sm:text-sm mt-1">Sales and dispensing reports</p>
          </div>

          <!-- Period Toggle: wrap on mobile, adjust padding -->
          <div class="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-2xl p-1">
            <button
              v-for="p in ['daily', 'monthly', 'yearly']"
              :key="p"
              @click="selectedPeriod = p as any"
              :class="[
                selectedPeriod === p
                  ? 'bg-green-600 text-white'
                  : 'text-slate-500 hover:bg-slate-50',
                'px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer capitalize'
              ]"
            >
              {{ p }}
            </button>
          </div>
        </div>

        <!-- Summary Cards: stack on mobile (1 col), 2 cols on larger screens -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p class="text-slate-500 text-xs sm:text-sm mb-2">Total Sales</p>
              <h2 class="text-xl sm:text-2xl font-black text-green-600">₱{{ grandTotal.toFixed(2) }}</h2>
            </div>
            <TrendingUp :size="32" class="text-green-600" />
          </div>

          <div class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p class="text-slate-500 text-xs sm:text-sm mb-2">Total Gallons</p>
              <h2 class="text-xl sm:text-2xl font-black text-green-600">{{ grandGallons }} pcs</h2>
            </div>
            <Droplets :size="32" class="text-green-600" />
          </div>
        </div>

        <!-- Report Table: horizontal scroll on mobile, reduced cell padding -->
        <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div class="px-4 sm:px-8 py-3 sm:py-5 border-b border-slate-100 flex items-center gap-2">
            <FileText :size="16" class="text-green-600" />
            <h3 class="font-bold text-gray-700 text-sm sm:text-base">
              {{ selectedPeriod === 'daily' ? 'Daily' : selectedPeriod === 'monthly' ? 'Monthly' : 'Yearly' }} Breakdown
            </h3>
          </div>

          <div v-if="currentData.length === 0" class="p-6 sm:p-10 text-center text-green-600 text-xs sm:text-sm">
            No data available for this period.
          </div>

          <!-- Table wrapper for horizontal scroll on mobile -->
          <div v-else class="overflow-x-auto">
            <table class="w-full min-w-[500px]">
              <thead class="bg-slate-50">
                <tr class="text-gray-600 text-xs">
                  <th class="text-left px-4 sm:px-8 py-4 sm:py-5">Period</th>
                  <th class="text-left px-4 sm:px-8 py-4 sm:py-5">Gallons Sold</th>
                  <th class="text-left px-4 sm:px-8 py-4 sm:py-5">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in currentData"
                  :key="row.label"
                  class="border-b border-slate-100 text-gray-700 text-xs hover:bg-slate-50 transition"
                >
                  <td class="px-4 sm:px-8 py-4 sm:py-5 font-medium whitespace-nowrap">{{ row.label }}</td>
                  <td class="px-4 sm:px-8 py-4 sm:py-5">{{ row.gallons }} pcs</td>
                  <td class="px-4 sm:px-8 py-4 sm:py-5 font-bold text-green-600 whitespace-nowrap">₱{{ row.total.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>