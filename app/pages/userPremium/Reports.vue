<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient } from '#imports'
import { FileText, TrendingUp, Droplets } from '@lucide/vue'
import Navbar from '~/components/userPremium/Navbar.vue'
import Sidebar from '~/components/userPremium/Sidebar.vue'

type Transaction = {
  id: string
  total_amount: number
  quantity: number
  created_at: string
}

type DebtPayment = {
  id: string
  transaction_id: string
  amount_paid: number
  paid_at: string
}

const client = useSupabaseClient()
const user = useSupabaseUser()

const selectedPeriod = ref<'daily' | 'monthly' | 'yearly'>('daily')
const dailyData = ref<{ date: string; total: number; gallons: number }[]>([])
const monthlyData = ref<{ month: string; total: number; gallons: number }[]>([])
const yearlyData = ref<{ year: string; total: number; gallons: number }[]>([])

// Philippines is UTC+8 with no DST. Grouping by raw created_at/paid_at using
// the browser/server's local timezone can put a sale or payment under the
// wrong calendar day relative to Manila time. These helpers convert any UTC
// timestamp into Philippine-time date/month/year labels so the report
// buckets match the calendar day a person in Manila would expect.
const PH_OFFSET_MS = 8 * 60 * 60 * 1000

const toPhDate = (isoString: string) => {
  const utcMs = new Date(isoString).getTime()
  return new Date(utcMs + PH_OFFSET_MS)
}

const phDayKey = (isoString: string) => {
  const d = toPhDate(isoString)
  // Sortable key for internal ordering, formatted label for display
  const sortKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
  const label = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  return { sortKey, label }
}

const phMonthKey = (isoString: string) => {
  const d = toPhDate(isoString)
  const sortKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
  const label = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
    .toLocaleDateString('en-PH', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  return { sortKey, label }
}

const phYearKey = (isoString: string) => {
  const d = toPhDate(isoString)
  const y = String(d.getUTCFullYear())
  return { sortKey: y, label: y }
}

const fetchReports = async () => {
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return

  const { data: txData } = await client
    .from('transactions')
    .select('id, total_amount, quantity, created_at')
    .eq('user_id', userId)
    .returns<Transaction[]>()

  if (!txData) return

  const { data: dpData } = await client
    .from('debt_payments')
    .select('id, transaction_id, amount_paid, paid_at')
    .eq('user_id', userId)
    .returns<DebtPayment[]>()

  const payments = dpData || []

  type Bucket = { total: number; gallons: number; sortKey: string }
  const dailyMap: Record<string, Bucket> = {}
  const monthlyMap: Record<string, Bucket> = {}
  const yearlyMap: Record<string, Bucket> = {}

  // Gets the existing bucket for `label` or creates one, returning a direct
  // reference. Avoids repeated `map[label]` lookups, which TypeScript (with
  // noUncheckedIndexedAccess) treats as possibly undefined even immediately
  // after an existence check on the line above.
  const getOrCreateBucket = (map: Record<string, Bucket>, label: string, sortKey: string): Bucket => {
    const existing = map[label]
    if (existing) return existing
    const created: Bucket = { total: 0, gallons: 0, sortKey }
    map[label] = created
    return created
  }

  // Revenue ("Total Sales") is grouped by the date money was actually
  // COLLECTED (debt_payments.paid_at), not by when the sale was created.
  // A June 20 utang paid off on June 21 now shows up under June 21 here —
  // matching the Transactions and Sales pages.
  for (const p of payments) {
    const amt = Number(p.amount_paid)

    const day = phDayKey(p.paid_at)
    getOrCreateBucket(dailyMap, day.label, day.sortKey).total += amt

    const month = phMonthKey(p.paid_at)
    getOrCreateBucket(monthlyMap, month.label, month.sortKey).total += amt

    const year = phYearKey(p.paid_at)
    getOrCreateBucket(yearlyMap, year.label, year.sortKey).total += amt
  }

  // Gallons sold are grouped by created_at — that reflects when the gallons
  // physically went out the door, independent of when payment is collected.
  for (const t of txData) {
    const qty = Number(t.quantity)

    const day = phDayKey(t.created_at)
    getOrCreateBucket(dailyMap, day.label, day.sortKey).gallons += qty

    const month = phMonthKey(t.created_at)
    getOrCreateBucket(monthlyMap, month.label, month.sortKey).gallons += qty

    const year = phYearKey(t.created_at)
    getOrCreateBucket(yearlyMap, year.label, year.sortKey).gallons += qty
  }

  dailyData.value = Object.entries(dailyMap)
    .sort((a, b) => b[1].sortKey.localeCompare(a[1].sortKey))
    .slice(0, 7)
    .map(([date, v]) => ({ date, total: v.total, gallons: v.gallons }))

  monthlyData.value = Object.entries(monthlyMap)
    .sort((a, b) => b[1].sortKey.localeCompare(a[1].sortKey))
    .slice(0, 12)
    .map(([month, v]) => ({ month, total: v.total, gallons: v.gallons }))

  yearlyData.value = Object.entries(yearlyMap)
    .sort((a, b) => b[1].sortKey.localeCompare(a[1].sortKey))
    .map(([year, v]) => ({ year, total: v.total, gallons: v.gallons }))
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