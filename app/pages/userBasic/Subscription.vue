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

        <div v-if="loading" class="text-center py-16 text-slate-400 text-sm">
          Loading subscription...
        </div>

        <div v-else-if="!subscription" class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
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
                  <span :class="['px-3 py-1 rounded-xl text-sm font-black uppercase', PLAN_COLORS[subscription.plan] || 'bg-slate-100 text-slate-700']">
                    {{ subscription.plan }}
                  </span>
                  <span :class="['px-3 py-1 rounded-xl text-xs font-semibold', statusColor]">
                    {{ isExpired ? 'Expired' : 'Active' }}
                  </span>
                </div>
                <p v-if="nextPayment" class="text-xs text-slate-400 mt-1">
                  Next payment due: {{ formatDate(nextPayment.due_date) }}
                </p>
              </div>
              <CreditCard :size="28" class="text-slate-300" />
            </div>

            <!-- Pricing Grid -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p class="text-xs text-slate-400 mb-1">Total Price</p>
                <p class="font-black text-slate-800 text-base">{{ formatPeso(subscription.total_price) }}</p>
              </div>
              <div class="bg-green-50 rounded-2xl p-4 border border-green-100">
                <p class="text-xs text-slate-400 mb-1">Downpayment Paid</p>
                <p class="font-black text-green-600 text-base">{{ formatPeso(subscription.downpayment) }}</p>
                <div class="flex items-center gap-1 mt-2">
                  <CheckCircle :size="12" class="text-green-500" />
                  <span class="text-xs text-green-600 font-semibold">Paid</span>
                </div>
              </div>
            </div>

            <!-- Remaining Balance & Monthly Due -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <p class="text-xs text-slate-400 mb-1">Remaining Balance</p>
                <p class="font-black text-blue-600 text-base">{{ formatPeso(subscription.remaining_balance) }}</p>
              </div>
              <div class="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                <p class="text-xs text-slate-400 mb-1">Monthly Installment</p>
                <p class="font-black text-violet-600 text-base">
                  {{ subscription.payment_months > 0 ? formatPeso(monthlyFee) : 'N/A' }}
                </p>
                <p v-if="subscription.payment_months > 0" class="text-xs text-slate-400 mt-2">
                  {{ subscription.payment_months }} months
                </p>
              </div>
            </div>

            <!-- Payment Status Banner -->
            <div v-if="isExpired"
              class="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <AlertCircle :size="18" class="text-red-500" />
                <div>
                  <p class="text-sm font-bold text-red-700">Payment Overdue</p>
                  <p class="text-xs text-red-500">Your access is restricted. Please pay your overdue amount.</p>
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
                  <p class="text-xs text-yellow-600">{{ daysRemaining }} day(s) left — Due {{ formatDate(nextPayment!.due_date) }}</p>
                </div>
              </div>
              <a href="https://www.facebook.com/ej.fron16" target="_blank"
                class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition whitespace-nowrap">
                Pay Now
              </a>
            </div>

            <!-- If payment_months === 0, show fully paid (e.g., Premium legacy or paid in full) -->
            <div v-else-if="subscription.payment_months === 0" class="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-center gap-2">
              <Crown :size="18" class="text-violet-500" />
              <div>
                <p class="text-sm font-bold text-violet-700">Fully Paid – No Installments</p>
                <p class="text-xs text-violet-600">You have no remaining payments.</p>
              </div>
            </div>

            <div v-else class="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-2">
              <CheckCircle :size="18" class="text-green-500" />
              <div>
                <p class="text-sm font-bold text-green-700">Subscription Active</p>
                <p class="text-xs text-green-600">
                  Next payment of {{ formatPeso(monthlyFee) }} due on {{ nextPayment ? formatDate(nextPayment.due_date) : '—' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Payment Schedule -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div class="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
              <Calendar :size="18" class="text-green-600" />
              <h3 class="font-bold text-slate-800">Payment Schedule</h3>
            </div>

            <div v-if="paymentSchedule.length === 0 && subscription.payment_months > 0" class="p-12 text-center">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <RefreshCw :size="20" class="text-slate-400" />
              </div>
              <p class="text-slate-400 text-sm">No payment schedule available</p>
            </div>

            <div v-else-if="subscription.payment_months === 0" class="p-8 text-center">
              <div class="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
                <Crown :size="20" class="text-violet-500" />
              </div>
              <p class="text-slate-600 font-semibold">No Installments</p>
              <p class="text-slate-400 text-sm mt-1">This plan is fully paid or has no monthly schedule.</p>
            </div>

            <div v-else class="divide-y divide-slate-50">
              <div
                v-for="payment in paymentSchedule"
                :key="payment.id"
                class="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg" :class="{
                    'bg-green-100': payment.status === 'paid',
                    'bg-yellow-100': payment.status === 'unpaid',
                    'bg-red-100': payment.status === 'overdue'
                  }">
                    <CheckCircle v-if="payment.status === 'paid'" :size="16" class="text-green-500" />
                    <Clock v-else-if="payment.status === 'unpaid'" :size="16" class="text-yellow-500" />
                    <AlertCircle v-else :size="16" class="text-red-500" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-700">{{ payment.month_label }}</p>
                    <p class="text-xs text-slate-400">
                      Due: {{ formatDate(payment.due_date) }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-slate-700">{{ formatPeso(payment.amount_due) }}</p>
                  <span class="px-2 py-0.5 rounded-lg text-[11px] font-semibold" :class="{
                    'bg-green-100 text-green-700': payment.status === 'paid',
                    'bg-yellow-100 text-yellow-700': payment.status === 'unpaid',
                    'bg-red-100 text-red-700': payment.status === 'overdue'
                  }">
                    {{ payment.status.charAt(0).toUpperCase() + payment.status.slice(1) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- How to Pay Footer -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <p class="text-xs text-slate-500 font-semibold mb-1">How to pay your monthly installment:</p>
              <p class="text-xs text-slate-400">Message us on Facebook or GCash to record your payment. Admin will update your account within 24 hours.</p>

              <div class="flex gap-2 flex-wrap">
                <button
                  @click="openGcashModal"
                  class="px-4 py-2 mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1"
                >
                  <span>Pay via GCash</span>
                </button>
                <a href="https://www.facebook.com/ej.fron16" target="_blank"
                  class="px-4 py-2 mt-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1">
                  <span>Contact Admin</span>
                </a>
              </div>
            </div>
          </div>

        </template>
      </div>
    </main>

    <QRcodepayment
      :open="showQrModal"
      :amount="monthlyFee"
      :qr-image="QRimage"
      @close="showQrModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useSupabaseClient } from '#imports'
import { CreditCard, CheckCircle, Clock, AlertCircle, Calendar, RefreshCw, Crown } from '@lucide/vue'
import QRcodepayment from '~/components/shared/QRcodepayment.vue'
import Navbar from '~/components/userBasic/Navbar.vue'
import Sidebar from '~/components/userBasic/Sidebar.vue'
import QRimage from '~/assets/images/qrhydrix.jpg'

const router = useRouter()
const showQrModal = ref(false)

const openGcashModal = () => {
  showQrModal.value = true
}

const client = useSupabaseClient()
const user = useSupabaseUser()

type PaymentSchedule = {
  id: string
  due_date: string
  amount_due: number
  amount_paid: number
  status: 'paid' | 'unpaid' | 'overdue'
  month_label: string
}

const subscription = ref<{
  plan: string
  total_price: number
  downpayment: number
  remaining_balance: number
  monthly_due: number
  payment_months: number
  start_date: string
  status: string
} | null>(null)

const paymentSchedule = ref<PaymentSchedule[]>([])
const loading = ref(true)

const fetchData = async () => {
  loading.value = true
  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) {
    loading.value = false
    return
  }

  // Fetch subscription
  const { data: sub } = await (client.from('subscriptions') as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (sub) {
    subscription.value = sub
    // Fetch payment schedule if there are months
    if (sub.payment_months > 0) {
      const { data: pays } = await (client.from('subscription_payments') as any)
        .select('*')
        .eq('subscription_id', sub.id)
        .order('due_date', { ascending: true })

      if (pays) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        paymentSchedule.value = pays.map((p: any) => {
          const due = new Date(p.due_date + 'T00:00:00')
          let status = p.status
          if (status === 'unpaid' && due < today) status = 'overdue'
          return {
            ...p,
            status,
            month_label: due.toLocaleDateString('en-PH', {
              month: 'long', year: 'numeric'
            })
          }
        })
      }
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

const nextPayment = computed(() => {
  return paymentSchedule.value.find(p => p.status === 'unpaid' || p.status === 'overdue')
})

const daysRemaining = computed(() => {
  const next = nextPayment.value
  if (!next) return null
  const due = new Date(next.due_date + 'T00:00:00')
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
})

const isExpired = computed(() => {
  const next = nextPayment.value
  return next ? next.status === 'overdue' : false
})

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

const monthlyFee = computed(() => subscription.value?.monthly_due || 0)

onMounted(() => fetchData())
</script>