<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { PhilippinePeso, Droplets, TrendingUp, Calendar } from '@lucide/vue'
import Navbar from '~/components/userPremium/Navbar.vue'
import Sidebar from '~/components/userPremium/Sidebar.vue'
import SalesStats from '~/components/userPremium/SalesStats.vue'

type Transaction = {
  id: string
  gallon_type: string
  quantity: number
  total_amount: number
  amount_paid: number
  balance_due: number
  payment_status: string
  created_at: string
}

type DebtPayment = {
  id: string
  transaction_id: string
  amount_paid: number
  paid_at: string
}

type GallonBreakdown = {
  '1gal': { quantity: number; amount: number }
  '2.5gal': { quantity: number; amount: number }
  '5gal': { quantity: number; amount: number }
}

const client = useSupabaseClient()
const user = useSupabaseUser()

const stats = ref({ 
  today: 0, 
  yesterday: 0, 
  thisMonth: 0, 
  thisYear: 0, 
  unpaidToday: 0,
  unpaidYesterday: 0,
  unpaidThisMonth: 0,
  unpaidThisYear: 0,
  totalGallons: 0 
})

const gallon_breakdown = ref<GallonBreakdown>({
  '1gal': { quantity: 0, amount: 0 },
  '2.5gal': { quantity: 0, amount: 0 },
  '5gal': { quantity: 0, amount: 0 },
})


const PH_OFFSET_MS = 8 * 60 * 60 * 1000

const toPhDateParts = (isoString: string) => {
  const utcMs = new Date(isoString).getTime()
  const phMs = utcMs + PH_OFFSET_MS
  const ph = new Date(phMs)
  return {
    dateKey: `${ph.getUTCFullYear()}-${String(ph.getUTCMonth() + 1).padStart(2, '0')}-${String(ph.getUTCDate()).padStart(2, '0')}`,
    month: ph.getUTCMonth(),
    year: ph.getUTCFullYear()
  }
}

const phNowParts = () => toPhDateParts(new Date().toISOString())

const fetchSales = async () => {
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return

  const { data: txData } = await client
    .from('transactions')
    .select('id, gallon_type, quantity, total_amount, amount_paid, balance_due, payment_status, created_at')
    .eq('user_id', userId)
    .returns<Transaction[]>()

  if (!txData) return

  const { data: dpData } = await client
    .from('debt_payments')
    .select('id, transaction_id, amount_paid, paid_at')
    .eq('user_id', userId)
    .returns<DebtPayment[]>()

  const payments = dpData || []
  const txById = new Map(txData.map(t => [t.id, t]))

  const now = phNowParts()
  const yesterdayParts = toPhDateParts(new Date(Date.now() - 86400000).toISOString())

  let today = 0, yesterday = 0, month = 0, year = 0
  let unpaidToday = 0, unpaidYesterday = 0, unpaidMonth = 0, unpaidYear = 0
  let gallons = 0

  const breakdown: GallonBreakdown = {
    '1gal': { quantity: 0, amount: 0 },
    '2.5gal': { quantity: 0, amount: 0 },
    '5gal': { quantity: 0, amount: 0 },
  }


  for (const p of payments) {
    const tx = txById.get(p.transaction_id)
    if (!tx) continue

    const paidParts = toPhDateParts(p.paid_at)
    const amt = Number(p.amount_paid)

    if (paidParts.dateKey === now.dateKey) today += amt
    if (paidParts.dateKey === yesterdayParts.dateKey) yesterday += amt
    if (paidParts.month === now.month && paidParts.year === now.year) month += amt
    if (paidParts.year === now.year) year += amt

    const key = tx.gallon_type as keyof GallonBreakdown
    if (breakdown[key]) {
      breakdown[key].amount += amt
    }
  }

  // Gallons sold and unpaid (utang/partial balance) are still tracked by the
  // sale's created_at — that reflects "how many gallons went out the door"
  // and "how much is currently owed", which are correctly dated by when the
  // sale itself happened, not when (or if) it gets paid.
  for (const t of txData) {
    const createdParts = toPhDateParts(t.created_at)
    const qty = Number(t.quantity)

    let unpaidAmt = 0
    if (t.payment_status === 'utang') {
      unpaidAmt = Number(t.total_amount)
    } else if (t.payment_status === 'partial') {
      unpaidAmt = Number(t.balance_due)
    }

    if (createdParts.dateKey === now.dateKey) unpaidToday += unpaidAmt
    if (createdParts.dateKey === yesterdayParts.dateKey) unpaidYesterday += unpaidAmt
    if (createdParts.month === now.month && createdParts.year === now.year) unpaidMonth += unpaidAmt
    if (createdParts.year === now.year) unpaidYear += unpaidAmt

    gallons += qty

    const key = t.gallon_type as keyof GallonBreakdown
    if (breakdown[key]) {
      breakdown[key].quantity += qty
    }
  }

  stats.value = { 
    today, 
    yesterday, 
    thisMonth: month, 
    thisYear: year,
    unpaidToday,
    unpaidYesterday,
    unpaidThisMonth: unpaidMonth,
    unpaidThisYear: unpaidYear,
    totalGallons: gallons 
  }
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

        <!-- SalesStats with both paid and unpaid data -->
        <SalesStats
          :today="stats.today"
          :yesterday="stats.yesterday"
          :this-month="stats.thisMonth"
          :this-year="stats.thisYear"
          :unpaid-today="stats.unpaidToday"
          :unpaid-yesterday="stats.unpaidYesterday"
          :unpaid-this-month="stats.unpaidThisMonth"
          :unpaid-this-year="stats.unpaidThisYear"
        />

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