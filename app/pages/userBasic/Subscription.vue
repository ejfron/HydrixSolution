<script setup lang="ts">
import { useSupabaseClient } from '#imports'
import { CreditCard, CheckCircle, Clock, AlertCircle, Calendar, RefreshCw } from '@lucide/vue'
import Navbar from '~/components/userBasic/Navbar.vue'
import Sidebar from '~/components/userBasic/Sidebar.vue'

const client = useSupabaseClient()
const user = useSupabaseUser()

type PaymentHistory = {
  id: string
  amount: number
  paid_at: string
  month_label: string
  status: 'paid'
}

const profile = ref<{
  plan: string
  subscription_status: string
  next_payment_date: string | null
  setup_fee_paid: boolean
} | null>(null)

const paymentHistory = ref<PaymentHistory[]>([])
const loading = ref(true)

const SETUP_FEE: Record<string, number> = {
  basic: 2500,
  standard: 5000,
  premium: 80000,
}
const MONTHLY_FEE: Record<string, number> = {
  basic: 500,
  standard: 500,
  premium: 0,
}

const fetchData = async () => {
  loading.value = true
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return

  const { data: profileData } = await (client.from('profiles') as any)
    .select('plan, subscription_status, next_payment_date, setup_fee_paid')
    .eq('id', userId)
    .single()

  if (profileData) profile.value = profileData

  // Fetch payment history from subscription_payments
  const { data: sub } = await (client.from('subscriptions') as any)
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (sub) {
    const { data: pays } = await (client.from('subscription_payments') as any)
      .select('*')
      .eq('subscription_id', sub.id)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })

    if (pays) {
      paymentHistory.value = pays.map((p: any) => ({
        id: p.id,
        amount: p.amount_paid,
        paid_at: p.paid_at,
        month_label: new Date(p.due_date + 'T00:00:00').toLocaleDateString('en-PH', {
          month: 'long', year: 'numeric'
        }),
        status: 'paid'
      }))
    }
  }

  loading.value = false
}

const formatDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric'
  })

const formatPeso = (n: number) =>
  `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

const today = new Date()
today.setHours(0, 0, 0, 0)

const daysRemaining = computed(() => {
  if (!profile.value?.next_payment_date) return null
  const due = new Date(profile.value.next_payment_date + 'T00:00:00')
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
})

const isExpired = computed(() =>
  profile.value?.subscription_status === 'expired' || (daysRemaining.value !== null && daysRemaining.value <= 0)
)

const statusColor = computed(() => {
  if (isExpired.value) return 'bg-red-100 text-red-700'
  if (daysRemaining.value !== null && daysRemaining.value <= 7) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
})

const PLAN_COLORS: Record<string, string> = {
  basic: 'bg-blue-100 text-blue-700',
  standard: 'bg-green-100 text-green-700',
  premium: 'bg-violet-100 text-violet-700',
}

onMounted(() => fetchData())
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />
      <div class="p-4 sm:p-8 space-y-6">

        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Subscription</h2>
          <p class="text-slate-500 text-xs sm:text-sm mt-1">Your plan details and monthly payment status</p>
        </div>

        <div v-if="loading" class="text-center py-16 text-slate-400 text-sm">
          Loading subscription...
        </div>

        <div v-else-if="!profile" class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CreditCard :size="28" class="text-slate-400" />
          </div>
          <h3 class="font-bold text-slate-700 text-lg mb-2">No subscription found</h3>
          <p class="text-slate-400 text-sm">Contact your administrator to set up your subscription.</p>
        </div>

        <template v-else>

          <!-- Plan Overview Card -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div class="flex items-start justify-between mb-6">
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <span :class="['px-3 py-1 rounded-xl text-sm font-black uppercase', PLAN_COLORS[profile.plan] || 'bg-slate-100 text-slate-700']">
                    {{ profile.plan }}
                  </span>
                  <span :class="['px-3 py-1 rounded-xl text-xs font-semibold', statusColor]">
                    {{ isExpired ? 'Expired' : `Active` }}
                  </span>
                </div>
                <p v-if="profile.next_payment_date" class="text-xs text-slate-400 mt-1">
                  Next payment due: {{ formatDate(profile.next_payment_date) }}
                </p>
              </div>
              <CreditCard :size="28" class="text-slate-300" />
            </div>

            <!-- Pricing Grid -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p class="text-xs text-slate-400 mb-1">Setup Fee</p>
                <p class="font-black text-slate-800 text-base">{{ formatPeso(SETUP_FEE[profile.plan] || 0) }}</p>
                <div class="flex items-center gap-1 mt-2">
                  <CheckCircle :size="12" class="text-green-500" />
                  <span class="text-xs text-green-600 font-semibold">Paid</span>
                </div>
              </div>
              <div class="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <p class="text-xs text-slate-400 mb-1">Monthly Fee</p>
                <p class="font-black text-blue-600 text-base">{{ formatPeso(MONTHLY_FEE[profile.plan] || 0) }}/mo</p>
                <p class="text-xs text-slate-400 mt-2">Ongoing subscription</p>
              </div>
            </div>

            <!-- Payment Status Banner -->
            <div v-if="isExpired"
              class="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <AlertCircle :size="18" class="text-red-500" />
                <div>
                  <p class="text-sm font-bold text-red-700">Payment Overdue</p>
                  <p class="text-xs text-red-500">Your access is restricted. Please pay ₱500 to continue.</p>
                </div>
              </div>
              <a href="https://www.facebook.com/ej.fron16" target="_blank"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition whitespace-nowrap">
                Pay Now
              </a>
            </div>

            <div v-else-if="daysRemaining !== null && daysRemaining <= 7"
              class="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Clock :size="18" class="text-yellow-600" />
                <div>
                  <p class="text-sm font-bold text-yellow-700">Payment Due Soon</p>
                  <p class="text-xs text-yellow-600">{{ daysRemaining }} day(s) left — Due {{ formatDate(profile.next_payment_date!) }}</p>
                </div>
              </div>
              <a href="https://www.facebook.com/ej.fron16" target="_blank"
                class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition whitespace-nowrap">
                Pay Now
              </a>
            </div>

            <div v-else class="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-2">
              <CheckCircle :size="18" class="text-green-500" />
              <div>
                <p class="text-sm font-bold text-green-700">Subscription Active</p>
                <p class="text-xs text-green-600">
                  Next payment of ₱500 due on {{ profile.next_payment_date ? formatDate(profile.next_payment_date) : '—' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Payment History -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div class="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
              <Calendar :size="18" class="text-green-600" />
              <h3 class="font-bold text-slate-800">Payment History</h3>
            </div>

            <div v-if="paymentHistory.length === 0" class="p-12 text-center">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <RefreshCw :size="20" class="text-slate-400" />
              </div>
              <p class="text-slate-400 text-sm">No payment history yet</p>
              <p class="text-slate-300 text-xs mt-1">Your monthly payments will appear here</p>
            </div>

            <div v-else class="divide-y divide-slate-50">
              <div
                v-for="payment in paymentHistory"
                :key="payment.id"
                class="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle :size="16" class="text-green-500" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-700">{{ payment.month_label }}</p>
                    <p class="text-xs text-green-500">
                      Paid on {{ new Date(payment.paid_at).toLocaleDateString('en-PH', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      }) }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-slate-700">{{ formatPeso(payment.amount) }}</p>
                  <span class="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-green-100 text-green-700">Paid</span>
                </div>
              </div>
            </div>

            <!-- How to Pay Footer -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <p class="text-xs text-slate-500 font-semibold mb-1">How to pay your monthly ₱500:</p>
              <p class="text-xs text-slate-400">Message us on Facebook or GCash to record your payment. Admin will update your account within 24 hours.</p>
              <a href="https://www.facebook.com/ej.fron16" target="_blank"
                class="inline-block mt-2 text-xs text-green-600 font-bold hover:underline">
                → Contact Admin on Facebook
              </a>
            </div>
          </div>

        </template>
      </div>
    </main>
  </div>
</template>