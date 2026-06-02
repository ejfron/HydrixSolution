
<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient } from '#imports'
import { CreditCard, CheckCircle, Clock, AlertCircle, Calendar } from '@lucide/vue'
import Navbar from '~/components/user/Navbar.vue'
import Sidebar from '~/components/user/Sidebar.vue'

const client = useSupabaseClient()
const user = useSupabaseUser()

type Subscription = {
  id: string
  plan: string
  total_price: number
  downpayment: number
  remaining_balance: number
  monthly_due: number
  payment_months: number
  start_date: string
  status: string
}

type Payment = {
  id: string
  due_date: string
  amount_due: number
  amount_paid: number
  status: 'unpaid' | 'paid' | 'overdue'
  paid_at: string | null
}

const subscription = ref<Subscription | null>(null)
const payments = ref<Payment[]>([])
const loading = ref(true)

const PLAN_COLORS: Record<string, string> = {
  basic:    'bg-blue-100 text-blue-700',
  standard: 'bg-green-100 text-green-700',
  premium:  'bg-violet-100 text-violet-700',
}

const fetchSubscription = async () => {
  loading.value = true
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return

  const { data: sub } = await (client.from('subscriptions') as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (sub) {
    subscription.value = sub

    const { data: pays } = await (client.from('subscription_payments') as any)
      .select('*')
      .eq('subscription_id', sub.id)
      .order('due_date', { ascending: true })

    if (pays) payments.value = pays
  }

  loading.value = false
}

const paidCount = computed(() => payments.value.filter(p => p.status === 'paid').length)
const unpaidCount = computed(() => payments.value.filter(p => p.status !== 'paid').length)
const totalPaid = computed(() =>
  payments.value.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount_paid), 0)
)

const progressPercent = computed(() => {
  if (!subscription.value) return 0
  const paid = Number(subscription.value.downpayment) + totalPaid.value
  return Math.min(100, Math.round((paid / subscription.value.total_price) * 100))
})

const formatDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric'
  })

const formatPeso = (n: number) =>
  `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

const statusIcon = (status: string) => {
  if (status === 'paid') return CheckCircle
  if (status === 'overdue') return AlertCircle
  return Clock
}

const statusClass = (status: string) => {
  if (status === 'paid') return 'text-green-500'
  if (status === 'overdue') return 'text-red-500'
  return 'text-yellow-500'
}

const statusBadge = (status: string) => {
  if (status === 'paid') return 'bg-green-100 text-green-700'
  if (status === 'overdue') return 'bg-red-100 text-red-600'
  return 'bg-yellow-100 text-yellow-700'
}

onMounted(() => fetchSubscription())
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <div class="p-4 sm:p-8 space-y-6">

        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Subscription</h2>
          <p class="text-slate-500 text-xs sm:text-sm mt-1">Your plan details and payment schedule</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-16 text-slate-400 text-sm">
          Loading subscription...
        </div>

        <!-- No subscription -->
        <div v-else-if="!subscription"
          class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CreditCard :size="28" class="text-slate-400" />
          </div>
          <h3 class="font-bold text-slate-700 text-lg mb-2">No subscription found</h3>
          <p class="text-slate-400 text-sm">Contact your administrator to set up your subscription.</p>
        </div>

        <template v-else>

          <!-- Subscription Card -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div class="flex items-start justify-between mb-6">
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <span :class="['px-3 py-1 rounded-xl text-sm font-black uppercase', PLAN_COLORS[subscription.plan] || 'bg-slate-100 text-slate-700']">
                    {{ subscription.plan }}
                  </span>
                  <span :class="['px-3 py-1 rounded-xl text-xs font-semibold',
                    subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                    subscription.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600']">
                    {{ subscription.status }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-1">Started {{ formatDate(subscription.start_date) }}</p>
              </div>
              <CreditCard :size="28" class="text-slate-300" />
            </div>

            <!-- Stats grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p class="text-xs text-slate-400 mb-1">Total Price</p>
                <p class="font-black text-slate-800 text-base">{{ formatPeso(subscription.total_price) }}</p>
              </div>
              <div class="bg-green-50 rounded-2xl p-4 border border-green-100">
                <p class="text-xs text-slate-400 mb-1">Downpayment</p>
                <p class="font-black text-green-600 text-base">{{ formatPeso(subscription.downpayment) }}</p>
              </div>
              <div class="bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
                <p class="text-xs text-slate-400 mb-1">Remaining Balance</p>
                <p class="font-black text-yellow-600 text-base">{{ formatPeso(subscription.remaining_balance - totalPaid) }}</p>
              </div>
              <div class="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <p class="text-xs text-slate-400 mb-1">Monthly Due</p>
                <p class="font-black text-blue-600 text-base">{{ formatPeso(subscription.monthly_due) }}</p>
              </div>
            </div>

            <!-- Progress bar -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs font-semibold text-slate-600">Payment Progress</p>
                <p class="text-xs font-bold text-green-600">{{ progressPercent }}%</p>
              </div>
              <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-green-500 rounded-full transition-all duration-500"
                  :style="{ width: `${progressPercent}%` }"
                />
              </div>
              <div class="flex justify-between mt-1.5">
                <p class="text-xs text-slate-400">{{ paidCount }} of {{ payments.length }} payments made</p>
                <p class="text-xs text-slate-400">{{ unpaidCount }} remaining</p>
              </div>
            </div>
          </div>

          <!-- Payment Schedule -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div class="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
              <Calendar :size="18" class="text-green-600" />
              <h3 class="font-bold text-slate-800">Payment Schedule</h3>
            </div>

            <div class="divide-y divide-slate-50">
              <!-- Downpayment row -->
              <div class="flex items-center justify-between px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle :size="16" class="text-green-500" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-700">Downpayment</p>
                    <p class="text-xs text-slate-400">{{ formatDate(subscription.start_date) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-green-600">{{ formatPeso(subscription.downpayment) }}</p>
                  <span class="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-green-100 text-green-700">Paid</span>
                </div>
              </div>

              <!-- Monthly payments -->
              <div
                v-for="(payment, index) in payments"
                :key="payment.id"
                class="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition"
              >
                <div class="flex items-center gap-3">
                  <div :class="['w-8 h-8 rounded-lg flex items-center justify-center',
                    payment.status === 'paid' ? 'bg-green-100' :
                    payment.status === 'overdue' ? 'bg-red-100' : 'bg-yellow-100']">
                    <component :is="statusIcon(payment.status)" :size="16" :class="statusClass(payment.status)" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-700">
                      Month {{ index + 1 }} — {{ new Date(payment.due_date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) }}
                    </p>
                    <p class="text-xs text-slate-400">Due: {{ formatDate(payment.due_date) }}</p>
                    <p v-if="payment.paid_at" class="text-xs text-green-500">
                      Paid on {{ new Date(payment.paid_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-slate-700">{{ formatPeso(payment.amount_due) }}</p>
                  <span :class="['px-2 py-0.5 rounded-lg text-[11px] font-semibold', statusBadge(payment.status)]">
                    {{ payment.status === 'paid' ? 'Paid' : payment.status === 'overdue' ? 'Overdue' : 'Unpaid' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Total footer -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <p class="text-sm font-bold text-slate-700">Total Contract</p>
              <p class="font-black text-slate-800 text-lg">{{ formatPeso(subscription.total_price) }}</p>
            </div>
          </div>

        </template>
      </div>
    </main>
  </div>
</template>