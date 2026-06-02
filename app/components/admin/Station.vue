<script setup lang="ts">
import { Plus, Settings, Droplets, Trash2, X, AlertTriangle, MapPin, RefreshCw } from '@lucide/vue'
import { useSupabaseClient } from '#imports'

const client = useSupabaseClient()

type Profile = {
  id: string
  full_name: string
  station_name: string
  email: string
  role: string
  location: string
  created_at: string
  subscription_status: string
  next_payment_date: string | null
}

type Transaction = {
  user_id: string
  quantity: number
  total_amount: number
}

const users = ref<(Profile & { total_sales: number; total_gallons: number })[]>([])

const loading = ref(true)
const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')
const createSuccess = ref('')

const showDeleteModal = ref(false)
const deletingId = ref<string | null>(null)
const deletingName = ref('')
const deleting = ref(false)

const newFullName = ref('')
const newStationName = ref('')
const newEmail = ref('')
const newLocation = ref('')
const newPassword = ref('')
const showPassword = ref(false)

// ==================== PLAN CONFIG ====================
const PLAN_CONFIG = {
  basic:    { total: 10000,  minDown: 2000,  maxMonths: 12,  label: 'Basic',    color: 'blue' },
  standard: { total: 15000,  minDown: 5000,  maxMonths: 12,  label: 'Standard', color: 'green' },
  premium:  { total: 80000,  minDown: 30000, maxMonths: 24,  label: 'Premium',  color: 'violet' },
}

const newPlan = ref<'basic' | 'standard' | 'premium'>('basic')
const newDownpayment = ref<number | null>(null)
const newPaymentMonths = ref(6)

const selectedPlanConfig = computed(() => PLAN_CONFIG[newPlan.value])

const remainingBalance = computed(() => {
  if (!newDownpayment.value) return selectedPlanConfig.value.total
  return Math.max(0, selectedPlanConfig.value.total - newDownpayment.value)
})

const monthlyDue = computed(() => {
  if (remainingBalance.value <= 0) return 0
  return Math.ceil(remainingBalance.value / newPaymentMonths.value)
})

const downpaymentError = computed(() => {
  if (!newDownpayment.value) return ''
  if (newDownpayment.value < selectedPlanConfig.value.minDown) {
    return `Minimum downpayment is ₱${selectedPlanConfig.value.minDown.toLocaleString()}`
  }
  return ''
})

const resetForm = () => {
  newFullName.value = ''
  newStationName.value = ''
  newEmail.value = ''
  newPassword.value = ''
  newLocation.value = ''
  newPlan.value = 'basic'
  newDownpayment.value = null
  newPaymentMonths.value = 6
  createError.value = ''
  createSuccess.value = ''
  showPassword.value = false
}

const openModal = () => { resetForm(); showCreateModal.value = true }
const closeModal = () => { showCreateModal.value = false; resetForm() }

const fetchUsers = async () => {
  loading.value = true

  const { data: profiles } = await client
    .from('profiles')
    .select('id, full_name, station_name, email, role, location, created_at, subscription_status, next_payment_date')
    .eq('role', 'user')
    .order('created_at', { ascending: false })
    .returns<Profile[]>()

  if (!profiles) { loading.value = false; return }

  const { data: transactions } = await client
    .from('transactions')
    .select('user_id, quantity, total_amount')
    .eq('status', 'completed')
    .returns<Transaction[]>()

  const totalsMap: Record<string, { sales: number; gallons: number }> = {}

  if (transactions) {
    for (const t of transactions) {
      if (!totalsMap[t.user_id]) totalsMap[t.user_id] = { sales: 0, gallons: 0 }
      totalsMap[t.user_id]!.sales += Number(t.total_amount)
      totalsMap[t.user_id]!.gallons += Number(t.quantity)
    }
  }

  users.value = profiles.map(p => ({
    ...p,
    total_sales: totalsMap[p.id]?.sales ?? 0,
    total_gallons: totalsMap[p.id]?.gallons ?? 0,
  }))

  loading.value = false
}

const createUser = async () => {
  if (!newEmail.value || !newPassword.value || !newStationName.value || !newLocation.value) {
    createError.value = 'Please fill in all required fields.'
    return
  }

  creating.value = true
  createError.value = ''
  createSuccess.value = ''

  const today = new Date()
  const subscriptionStart = today.toLocaleDateString('en-CA')
  const nextPayment = new Date(today) // clone today
  nextPayment.setMonth(nextPayment.getMonth() + 1)
  const nextPaymentDate = nextPayment.toLocaleDateString('en-CA')

  try {
    await $fetch('/api/create-user', {
      method: 'POST',
      body: {
        email: newEmail.value,
        password: newPassword.value,
        fullName: newFullName.value,
        stationName: newStationName.value,
        location: newLocation.value,
        subscriptionStart: subscriptionStart,   // correct local date
        nextPaymentDate: nextPaymentDate,   
        plan: newPlan.value,
        downpayment: newDownpayment.value,
        paymentMonths: newPaymentMonths.value,
      }
    })

    createSuccess.value = `Account for ${newStationName.value} created successfully!`
    creating.value = false

    setTimeout(async () => {
      await fetchUsers()
      closeModal()
    }, 1500)
  } catch (err: any) {
    createError.value = err.data?.message || err.message || 'Failed to create user'
    creating.value = false
  }
}

const renewSubscription = async (userId: string) => {
  const nextPayment = new Date()
  nextPayment.setMonth(nextPayment.getMonth() + 1)

  await (client.from('profiles') as any)
    .update({
      next_payment_date: nextPayment.toISOString().split('T')[0],
      subscription_status: 'active',
    })
    .eq('id', userId)

  await fetchUsers()
}

const confirmDelete = (id: string, name: string) => {
  deletingId.value = id
  deletingName.value = name
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!deletingId.value) return
  deleting.value = true

  const { error } = await client.rpc('delete_user_by_id', { user_id: deletingId.value } as any)

  if (error) {
    deleting.value = false
    return
  }

  users.value = users.value.filter(u => u.id !== deletingId.value)
  showDeleteModal.value = false
  deletingId.value = null
  deletingName.value = ''
  deleting.value = false
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deletingId.value = null
  deletingName.value = ''
}

// ==================== ADMIN: MARK PAYMENT PAID (Step 6) ====================
const markPaymentPaid = async (paymentId: string, subscriptionId: string) => {
  // Fetch the amount due for this payment
  const { data: paymentData } = await (client.from('subscription_payments') as any)
    .select('amount_due')
    .eq('id', paymentId)
    .single()

  const amountDue = paymentData?.amount_due

  // Update payment as paid
  await (client.from('subscription_payments') as any)
    .update({
      status: 'paid',
      amount_paid: amountDue,
      paid_at: new Date().toISOString(),
    })
    .eq('id', paymentId)

  // Check if all payments are now paid
  const { data: remainingUnpaid } = await (client.from('subscription_payments') as any)
    .select('id')
    .eq('subscription_id', subscriptionId)
    .neq('status', 'paid')   // any not paid

  if (!remainingUnpaid || remainingUnpaid.length === 0) {
    await (client.from('subscriptions') as any)
      .update({ status: 'completed' })
      .eq('id', subscriptionId)
  }
}

onMounted(() => fetchUsers())
</script>

<template>
  <div class="relative w-full overflow-hidden p-3 sm:p-4">
    <div class="relative z-10">

      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl text-gray-700 font-bold">Water Stations</h2>
          <p class="text-sm text-slate-500 mt-1">{{ users.length }} station(s) registered</p>
        </div>
        <button
          @click="openModal"
          class="w-full sm:w-auto px-6 py-3 cursor-pointer rounded-sm bg-green-600 text-white hover:bg-green-700 hover:scale-105 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-3"
        >
          <Plus class="w-5 h-5" />
          Create User
        </button>
      </div>

      <div class="mt-5 bg-green-200 w-full h-0.5" />

      <!-- Loading -->
      <div v-if="loading" class="mt-10 text-center text-slate-400 text-sm">
        Loading stations...
      </div>

      <!-- Empty -->
      <div v-else-if="users.length === 0" class="mt-10 text-center text-slate-400 text-sm">
        No stations registered yet.
      </div>

      <!-- Cards -->
      <div v-else class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div
          v-for="user in users"
          :key="user.id"
          class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <div class="absolute top-0 left-0 w-full h-0.5 bg-green-600" />

          <!-- Card Header -->
          <div class="flex items-start justify-between mb-5">
            <div class="flex items-center gap-3 sm:gap-4 min-w-0">
              <div class="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-green-100 flex items-center justify-center">
                <Droplets class="text-green-600" />
              </div>
              <div class="min-w-0">
                <h2 class="text-sm font-bold text-slate-800 truncate">
                  {{ user.station_name || 'Unnamed Station' }}
                </h2>
                <p class="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin :size="10" class="shrink-0" />
                  {{ user.location || 'No location' }}
                </p>
              </div>
            </div>

            <button
              @click="confirmDelete(user.id, user.station_name || 'this station')"
              class="w-9 h-9 sm:w-10 sm:h-10 shrink-0 cursor-pointer rounded-xl hover:bg-red-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition ml-2"
            >
              <Trash2 :size="16" />
            </button>
          </div>

          <!-- Card Body -->
          <div class="space-y-3 sm:space-y-4">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-slate-500 shrink-0">Owner</span>
              <span class="text-sm text-slate-700 truncate text-right">{{ user.full_name || '—' }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-slate-500 shrink-0">Email</span>
              <span class="text-sm text-slate-700 truncate max-w-40 sm:max-w-40 text-right">{{ user.email }}</span>
            </div>
            
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-slate-500 shrink-0">Status</span>
              <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs sm:text-sm font-semibold">
                <div class="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                Online
              </div>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-slate-500 shrink-0">Joined</span>
              <span class="text-sm text-slate-700 text-right">
                {{ new Date(user.created_at).toLocaleDateString('en-PH', {
                  year: 'numeric', month: 'short', day: 'numeric'
                }) }}
              </span>
            </div>

            <!-- Subscription Status -->
            <div
              :class="[
                'rounded-xl px-3 py-2 text-xs font-semibold flex items-center justify-between gap-2',
                user.subscription_status === 'active'
                  ? 'bg-green-50 text-green-700 border border-green-100'
                  : 'bg-red-50 text-red-600 border border-red-100'
              ]"
            >
              <span>{{ user.subscription_status === 'active' ? 'Active' : 'Expired' }}</span>
              <span class="truncate">Due: {{ user.next_payment_date || '—' }}</span>
            </div>

            <!-- Renew button if expired -->
            <button
              v-if="user.subscription_status === 'expired'"
              @click="renewSubscription(user.id)"
              class="w-full py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw :size="13" />
              Renew Subscription
            </button>

            <!-- Total Sales -->
            <div class="mt-2 rounded-2xl bg-slate-50 p-3 sm:p-4 border border-slate-100">
              <p class="text-xs text-slate-500 mb-1">Total Sales</p>
              <h1 class="text-lg font-bold text-green-700">
                ₱{{ user.total_sales.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}
              </h1>
              <p class="text-xs text-green-400 mt-1">
                {{ user.total_gallons }} Gallons Sold
              </p>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="mt-5 sm:mt-6 flex items-center gap-3">
            <button class="flex-1 py-3 text-xs cursor-pointer rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition">
              View Station
            </button>
            <button class="w-11 h-11 sm:w-12 sm:h-12 cursor-pointer flex items-center justify-center rounded-2xl border border-slate-200 hover:bg-slate-100 transition shrink-0">
              <Settings class="text-gray-700" :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <Transition name="scale">
          <div class="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center">
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle class="text-red-500" :size="26" />
            </div>
            <h2 class="text-lg sm:text-xl font-black text-gray-800 mb-2">Delete Station</h2>
            <p class="text-sm text-slate-500 mb-6">
              Are you sure you want to delete
              <span class="font-bold text-gray-700">{{ deletingName }}</span>?
              This action cannot be undone.
            </p>
            <div class="flex gap-3">
              <button @click="deleteUser" :disabled="deleting"
                class="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm transition cursor-pointer">
                {{ deleting ? 'Deleting...' : 'Yes, Delete' }}
              </button>
              <button @click="cancelDelete"
                class="flex-1 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </Transition>
        <div class="absolute inset-0 -z-10" @click="cancelDelete" />
      </div>
    </Transition>

    <!-- Create User Modal -->
    <Transition name="fade">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6">
        <Transition name="slide-up">
          <div class="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95dvh] flex flex-col">

            <div class="bg-green-600 px-6 sm:px-8 py-5 sm:py-6 text-white flex items-center justify-between shrink-0">
              <div>
                <h2 class="text-lg sm:text-xl font-black">Create New User</h2>
                <p class="text-green-100 text-xs sm:text-sm mt-0.5">Register a new water station account</p>
              </div>
              <button @click="closeModal"
                class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition shrink-0">
                <X :size="18" />
              </button>
            </div>

            <!-- Scrollable body -->
            <div class="p-6 sm:p-8 overflow-y-auto">
              <div v-if="createError" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                {{ createError }}
              </div>
              <div v-if="createSuccess" class="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-sm">
                {{ createSuccess }}
              </div>

              <div class="space-y-4">
                <!-- Full Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input v-model="newFullName" type="text" placeholder="Enter full name"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                </div>

                <!-- Water Station Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Water Station Name <span class="text-red-400">*</span>
                  </label>
                  <input v-model="newStationName" type="text" required placeholder="e.g. KRGM Water Station"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                </div>

                <!-- Station Location -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Station Location <span class="text-red-400">*</span>
                  </label>
                  <input v-model="newLocation" type="text" required placeholder="e.g. Taytay, Rizal"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                </div>

                <!-- Email Address -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span class="text-red-400">*</span>
                  </label>
                  <input v-model="newEmail" type="email" required placeholder="Enter email"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                </div>

                <!-- Plan Selection -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Plan <span class="text-red-400">*</span>
                  </label>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      v-for="(config, key) in PLAN_CONFIG" :key="key"
                      type="button"
                      @click="newPlan = key as any; newDownpayment = null"
                      :class="[
                        'py-3 px-2 rounded-2xl border-2 text-xs font-bold transition cursor-pointer text-center',
                        newPlan === key
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      ]"
                    >
                      <p>{{ config.label }}</p>
                      <p class="font-normal opacity-70 mt-0.5">₱{{ config.total.toLocaleString() }}</p>
                    </button>
                  </div>
                </div>

                <!-- Plan Details -->
                <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-1.5">
                  <div class="flex justify-between">
                    <span class="text-slate-500">Total Price</span>
                    <span class="font-bold text-slate-700">₱{{ selectedPlanConfig.total.toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Min. Downpayment</span>
                    <span class="font-bold text-slate-700">₱{{ selectedPlanConfig.minDown.toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Max Payment Period</span>
                    <span class="font-bold text-slate-700">{{ selectedPlanConfig.maxMonths }} months</span>
                  </div>
                </div>

                <!-- Downpayment -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Downpayment <span class="text-red-400">*</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                    <input
                      v-model.number="newDownpayment"
                      type="number"
                      :min="selectedPlanConfig.minDown"
                      :max="selectedPlanConfig.total"
                      :placeholder="`Min ₱${selectedPlanConfig.minDown.toLocaleString()}`"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                  </div>
                  <p v-if="downpaymentError" class="text-red-500 text-xs mt-1">{{ downpaymentError }}</p>
                </div>

                <!-- Payment Months -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Payment Period</label>
                  <select
                    v-model.number="newPaymentMonths"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option v-for="m in Array.from({length: selectedPlanConfig.maxMonths}, (_, i) => i + 1)" :key="m" :value="m">
                      {{ m }} month{{ m > 1 ? 's' : '' }}
                    </option>
                  </select>
                </div>

                <!-- Payment Preview -->
                <div v-if="newDownpayment && !downpaymentError" class="bg-green-50 rounded-2xl p-4 border border-green-100">
                  <p class="text-xs text-green-700 font-semibold mb-2">Payment Summary</p>
                  <div class="space-y-1.5 text-xs">
                    <div class="flex justify-between">
                      <span class="text-slate-500">Downpayment</span>
                      <span class="font-bold text-green-600">₱{{ newDownpayment.toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-500">Remaining Balance</span>
                      <span class="font-bold text-slate-700">₱{{ remainingBalance.toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between border-t border-green-100 pt-1.5">
                      <span class="text-slate-500">Monthly Due ({{ newPaymentMonths }}mo)</span>
                      <span class="font-bold text-slate-700">₱{{ monthlyDue.toLocaleString() }}/mo</span>
                    </div>
                  </div>
                </div>

                <!-- Password -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span class="text-red-400">*</span>
                  </label>
                  <div class="relative">
                    <input v-model="newPassword" :type="showPassword ? 'text' : 'password'" required minlength="6"
                      placeholder="Minimum 6 characters"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-16 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <button type="button" @click="showPassword = !showPassword"
                      class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-green-600">
                      {{ showPassword ? 'Hide' : 'Show' }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex gap-3 mt-6">
                <button @click="createUser" :disabled="creating"
                  class="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-2xl font-bold text-sm transition">
                  {{ creating ? 'Creating...' : 'Create User' }}
                </button>
                <button @click="closeModal"
                  class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Transition>
        <div class="absolute inset-0 -z-10" @click="closeModal" />
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active, .scale-leave-active { transition: all 0.25s ease; }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.95); }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(100%); }
@media (min-width: 640px) {
  .slide-up-enter-from, .slide-up-leave-to { transform: scale(0.95); }
}
</style>