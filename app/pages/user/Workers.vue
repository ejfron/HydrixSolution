<script lang="ts" setup>

definePageMeta({ middleware: ['auth'] })
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSupabaseClient } from '#imports'
import { useRoute } from '#app'
import {
  Plus, X, Trash2, ChevronDown, ChevronUp,
  Users2, Wallet, Clock, CalendarDays,
  CheckCircle, AlertCircle, Banknote, Save, RefreshCw, Lock,
  Check
} from '@lucide/vue'
import Navbar from '~/components/user/Navbar.vue'
import Sidebar from '~/components/user/Sidebar.vue'
import PasscodeSetup from '~/components/user/PasscodeSetup.vue'
import PasscodeVerify from '~/components/user/PasscodeVerify.vue'
import PasscodeReset from '~/components/user/PasscodeReset.vue'
import DeleteConfirmModal from '~/components/user/DeleteConfirmModal.vue'

const client = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

// ─── Types ──────────────────────────────────────────────────────
type Worker = {
  id: string
  name: string
  rate: number
  regular_hours: number
  pay_schedule: 'weekly' | 'kinsenas'
  is_active: boolean
  created_at: string
}

type WorkLog = {
  id: string
  worker_id: string
  work_date: string
  hours_worked: number
  overtime_hrs: number
  notes: string | null
  isPaid?: boolean
}

type Payroll = {
  id: string
  worker_id: string
  period_start: string
  period_end: string
  days_worked: number
  total_hours: number
  overtime_hours: number
  gross_pay: number
  cash_advance: number
  net_pay: number
  status: 'pending' | 'paid'
  created_at: string
}

type CashAdvance = {
  id: string
  worker_id: string
  amount: number
  reason: string | null
  status: 'unpaid' | 'deducted'
  created_at: string
}

type DayEntry = {
  date: string
  dayName: string
  hoursWorked: number
  overtimeHours: number
  notes: string
  isWorkDay: boolean
}

// ─── Passcode ───────────────────────────────────────────────────
const {
  isAuthenticated,
  showPasscodeModal,
  showSetupModal,
  hasPasscode,
  setupPasscode,
  verifyPasscode,
  resetAuth,
  checkSession
} = useWorkersPasscode()

const isUnlocked = ref(false)
const showResetModal = ref(false)
const showDeleteModal = ref(false)
const workerToDelete = ref<string | null>(null)
const deletingWorker = ref(false)

onBeforeUnmount(() => resetAuth())

watch(() => route.path, (newPath, oldPath) => {
  if (oldPath === '/user/Workers' && newPath !== '/user/Workers') resetAuth()
})

onMounted(async () => {
  checkSession()
  await fetchWorkers()
  if (!isAuthenticated.value) {
    if (hasPasscode.value) showPasscodeModal.value = true
    else showSetupModal.value = true
  } else {
    isUnlocked.value = true
  }
})

const onSetupSuccess = (passcode: string) => {
  if (setupPasscode(passcode)) {
    showSetupModal.value = false
    isAuthenticated.value = true
    isUnlocked.value = true
    showSuccess('Passcode created successfully!')
  }
}

const onVerifySuccess = (passcode: string) => {
  if (verifyPasscode(passcode)) {
    isUnlocked.value = true
    showPasscodeModal.value = false
    showSuccess('Access granted!')
  }
}

const onCancel = () => navigateTo('/user')

const onForgotPasscode = () => {
  showPasscodeModal.value = false
  showResetModal.value = true
}

const onResetSuccess = (newPasscode: string) => {
  if (setupPasscode(newPasscode)) {
    showResetModal.value = false
    showSuccess('Passcode reset! Please login again.')
    setTimeout(() => { resetAuth(); navigateTo('/user') }, 1500)
  }
}

const onResetCancel = () => {
  showResetModal.value = false
  showPasscodeModal.value = true
}

// ─── State ──────────────────────────────────────────────────────
const workers = ref<Worker[]>([])
const expandedWorker = ref<string | null>(null)
const workLogs = ref<Record<string, WorkLog[]>>({})
const payrollHistory = ref<Record<string, Payroll[]>>({})
const cashAdvances = ref<Record<string, CashAdvance[]>>({})

// Create worker
const showCreateWorker = ref(false)
const creatingWorker = ref(false)
const workerError = ref('')
const newWorkerName = ref('')
const newWorkerRate = ref<number | null>(null)
const newWorkerHours = ref(8)
const newWorkerSchedule = ref<'weekly' | 'kinsenas'>('weekly')

// Work log
const showAddLog = ref(false)
const selectedWorkerId = ref<string | null>(null)
const logStartDate = ref('')
const logNumberOfDays = ref(7)
const dayEntries = ref<DayEntry[]>([])
const addingLog = ref(false)

// Payroll
const showPayroll = ref(false)
const payrollWorkerId = ref<string | null>(null)
const payrollStart = ref('')
const payrollEnd = ref('')
const computingPayroll = ref(false)
const payrollPreview = ref<{
  days: number; hours: number; overtime: number
  gross: number; totalCashAdvance: number; net: number
} | null>(null)

// Cash advance
const showCashAdvance = ref(false)
const caWorkerId = ref<string | null>(null)
const caAmount = ref<number | null>(null)
const caReason = ref('')
const addingCA = ref(false)

const successMsg = ref('')

// ─── Helpers ─────────────────────────────────────────────────────
const getUserId = async () => {
  const { data: { session } } = await client.auth.getSession()
  return user.value?.id ?? session?.user?.id
}

const getWorker = (id: string | null) => id ? workers.value.find(w => w.id === id) : undefined

const formatDateToYYYYMMDD = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' })

const formatDateDisplay = (dateString: string) =>
  new Date(dateString + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', weekday: 'short'
  })

const formatDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

const formatPeso = (n: number) =>
  `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

const showSuccess = (msg: string) => {
  successMsg.value = msg
  setTimeout(() => successMsg.value = '', 3000)
}

const totalUnpaidCA = (id: string) =>
  cashAdvances.value[id]?.filter(a => a.status === 'unpaid')
    .reduce((s, a) => s + Number(a.amount), 0) ?? 0

// ─── Day entries ─────────────────────────────────────────────────
const generateDayEntries = () => {
  if (!logStartDate.value || !selectedWorkerId.value) { dayEntries.value = []; return }
  const worker = getWorker(selectedWorkerId.value)
  if (!worker) return
  const startDate = new Date(logStartDate.value + 'T00:00:00')
  const entries: DayEntry[] = []
  for (let i = 0; i < logNumberOfDays.value; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    entries.push({
      date: formatDateToYYYYMMDD(d),
      dayName: getDayName(d),
      hoursWorked: worker.regular_hours,
      overtimeHours: 0,
      notes: '',
      isWorkDay: true,
    })
  }
  dayEntries.value = entries
}

const toggleWorkDay = (index: number) => {
  const entry = dayEntries.value[index]
  if (!entry) return
  entry.isWorkDay = !entry.isWorkDay
  if (!entry.isWorkDay) {
    entry.hoursWorked = 0
    entry.overtimeHours = 0
    entry.notes = 'Day Off'
  } else {
    const worker = getWorker(selectedWorkerId.value)
    entry.hoursWorked = worker?.regular_hours ?? 8
    entry.overtimeHours = 0
    entry.notes = ''
  }
}

const markAllWorkDays = () => {
  const worker = getWorker(selectedWorkerId.value)
  dayEntries.value.forEach(e => {
    if (e) { e.isWorkDay = true; e.hoursWorked = worker?.regular_hours ?? 8; e.overtimeHours = 0; e.notes = '' }
  })
}

const setAllHours = (hours: number) => {
  if (!hours || hours <= 0) return
  dayEntries.value.forEach(e => {
    if (e?.isWorkDay) e.hoursWorked = hours
  })
}

const totalWorkDays = computed(() => dayEntries.value.filter(e => e?.isWorkDay).length)
const totalLogHours = computed(() => dayEntries.value.reduce((s, e) => s + (e?.isWorkDay ? e.hoursWorked : 0), 0))
const totalLogOvertime = computed(() => dayEntries.value.reduce((s, e) => s + (e?.isWorkDay ? e.overtimeHours : 0), 0))

watch([logStartDate, logNumberOfDays], () => { if (showAddLog.value) generateDayEntries() })

// ─── FIXED: Get paid date ranges for a worker ─────────────────────
const getPaidDateRanges = async (workerId: string): Promise<Array<{ start: string; end: string }>> => {
  const { data } = await (client.from('payroll') as any)
    .select('period_start, period_end')
    .eq('worker_id', workerId)
    .eq('status', 'paid')

  if (!data || data.length === 0) return []
  return data.map((p: any) => ({ start: p.period_start, end: p.period_end }))
}

// ─── FIXED: Check if a date falls within any paid payroll period ──
const isDatePaid = (date: string, paidRanges: Array<{ start: string; end: string }>): boolean => {
  return paidRanges.some(range => date >= range.start && date <= range.end)
}

// ─── Fetch workers ────────────────────────────────────────────────
const fetchWorkers = async () => {
  const userId = await getUserId()
  if (!userId) return
  const { data } = await (client.from('workers') as any)
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (data) workers.value = data
}

// ─── FIXED: Fetch work logs — only show UNPAID logs ───────────────
const fetchWorkLogs = async (workerId: string) => {
  // Get all paid date ranges for this worker first
  const paidRanges = await getPaidDateRanges(workerId)

  // Get all work logs
  const { data } = await (client.from('work_logs') as any)
    .select('*')
    .eq('worker_id', workerId)
    .order('work_date', { ascending: false })
    .limit(60) // fetch more so after filtering we still have enough

  if (!data) return

  // Tag each log with isPaid status
  const logsWithStatus: WorkLog[] = data.map((log: WorkLog) => ({
    ...log,
    isPaid: isDatePaid(log.work_date, paidRanges)
  }))

  // Only show UNPAID logs in recent section — paid ones are already in payroll history
  workLogs.value[workerId] = logsWithStatus.filter(log => !log.isPaid).slice(0, 15)
}

const fetchPayrollHistory = async (workerId: string) => {
  const { data } = await (client.from('payroll') as any)
    .select('*')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false })
  if (data) payrollHistory.value[workerId] = data
}

const fetchCashAdvances = async (workerId: string) => {
  const { data } = await (client.from('cash_advances') as any)
    .select('*')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false })
  if (data) cashAdvances.value[workerId] = data
}

const toggleExpand = async (workerId: string) => {
  if (expandedWorker.value === workerId) { expandedWorker.value = null; return }
  expandedWorker.value = workerId
  await Promise.all([
    fetchWorkLogs(workerId),
    fetchPayrollHistory(workerId),
    fetchCashAdvances(workerId),
  ])
}

// ─── Create worker ────────────────────────────────────────────────
const createWorker = async () => {
  if (!newWorkerName.value || !newWorkerRate.value) {
    workerError.value = 'Please fill in all required fields.'
    return
  }
  const userId = await getUserId()
  if (!userId) return
  creatingWorker.value = true
  workerError.value = ''
  const { error } = await (client.from('workers') as any).insert({
    user_id: userId,
    name: newWorkerName.value,
    rate: newWorkerRate.value,
    regular_hours: newWorkerHours.value,
    pay_schedule: newWorkerSchedule.value,
  })
  if (!error) {
    newWorkerName.value = ''
    newWorkerRate.value = null
    newWorkerHours.value = 8
    newWorkerSchedule.value = 'weekly'
    showCreateWorker.value = false
    await fetchWorkers()
    showSuccess('Worker created successfully!')
  } else {
    workerError.value = error.message
  }
  creatingWorker.value = false
}

const openDeleteWorker = (id: string) => {
  workerToDelete.value = id
  showDeleteModal.value = true
}

const deleteWorker = async () => {
  if (!workerToDelete.value) return

  deletingWorker.value = true

  const { error } = await (client.from('workers') as any)
    .update({ is_active: false })
    .eq('id', workerToDelete.value)

  if (!error) {
    workers.value = workers.value.filter(
      w => w.id !== workerToDelete.value
    )

    if (expandedWorker.value === workerToDelete.value) {
      expandedWorker.value = null
    }

    showSuccess('Worker deleted successfully!')
  }

  deletingWorker.value = false
  showDeleteModal.value = false
  workerToDelete.value = null
}

// ─── Work log ─────────────────────────────────────────────────────
const openAddLog = (workerId: string) => {
  const worker = getWorker(workerId)
  if (!worker) return
  selectedWorkerId.value = workerId
  logStartDate.value = formatDateToYYYYMMDD(new Date())
  logNumberOfDays.value = worker.pay_schedule === 'weekly' ? 7 : 15
  generateDayEntries()
  showAddLog.value = true
}

const addWorkLog = async () => {
  if (!selectedWorkerId.value) return
  const userId = await getUserId()
  if (!userId) return
  addingLog.value = true
  const workEntries = dayEntries.value.filter(e => e?.isWorkDay)
  const { error } = await (client.from('work_logs') as any).insert(
    workEntries.map(e => ({
      worker_id: selectedWorkerId.value,
      user_id: userId,
      work_date: e.date,
      hours_worked: e.hoursWorked,
      overtime_hrs: e.overtimeHours,
      notes: e.notes || null,
    }))
  )
  if (!error) {
    showAddLog.value = false
    dayEntries.value = []
    await fetchWorkLogs(selectedWorkerId.value!)
    showSuccess(`${workEntries.length} work days logged successfully!`)
  }
  addingLog.value = false
}

// ─── FIXED: Auto-detect UNPAID work period ────────────────────────
const getUnpaidWorkPeriod = async (workerId: string) => {
  const worker = getWorker(workerId)
  if (!worker) return null

  // Get all paid date ranges
  const paidRanges = await getPaidDateRanges(workerId)

  // Get all work logs ordered by date ascending
  const { data: allLogs } = await (client.from('work_logs') as any)
    .select('work_date')
    .eq('worker_id', workerId)
    .order('work_date', { ascending: true })

  if (!allLogs || allLogs.length === 0) return null

  // Filter to only UNPAID logs
  const unpaidLogs = allLogs.filter((log: { work_date: string }) =>
    !isDatePaid(log.work_date, paidRanges)
  )

  if (unpaidLogs.length === 0) return null

  // Use earliest unpaid log as start, latest as end
  const start = unpaidLogs[0].work_date
  const end = unpaidLogs[unpaidLogs.length - 1].work_date

  return { start, end }
}

// ─── Payroll ──────────────────────────────────────────────────────
const computePayroll = async () => {
  if (!payrollWorkerId.value || !payrollStart.value || !payrollEnd.value) return
  const worker = getWorker(payrollWorkerId.value)
  if (!worker) return

  const { data: logs } = await (client.from('work_logs') as any)
    .select('*')
    .eq('worker_id', payrollWorkerId.value)
    .gte('work_date', payrollStart.value)
    .lte('work_date', payrollEnd.value)
    .order('work_date', { ascending: true })

  const days = logs?.length ?? 0
  const totalHours = logs?.reduce((s: number, l: WorkLog) => s + Number(l.hours_worked), 0) ?? 0
  const overtimeHours = logs?.reduce((s: number, l: WorkLog) => s + Number(l.overtime_hrs), 0) ?? 0

  const hourlyRate = worker.rate / worker.regular_hours
 
  const regularPay = totalHours * hourlyRate

 
  const overtimePay = overtimeHours * hourlyRate * 1.25

  const gross = regularPay + overtimePay

  const { data: advances } = await (client.from('cash_advances') as any)
    .select('amount')
    .eq('worker_id', payrollWorkerId.value)
    .eq('status', 'unpaid')

  const totalCA = advances?.reduce((s: number, a: any) => s + Number(a.amount), 0) ?? 0

  payrollPreview.value = {
    days,
    hours: totalHours,
    overtime: overtimeHours,
    gross,
    totalCashAdvance: totalCA,
    net: Math.max(0, gross - totalCA),
  }
}

const savePayroll = async () => {
  if (!payrollWorkerId.value || !payrollPreview.value) return
  const userId = await getUserId()
  if (!userId) return
  computingPayroll.value = true

  const { error } = await (client.from('payroll') as any).insert({
    worker_id: payrollWorkerId.value,
    user_id: userId,
    period_start: payrollStart.value,
    period_end: payrollEnd.value,
    days_worked: payrollPreview.value.days,
    total_hours: payrollPreview.value.hours,
    overtime_hours: payrollPreview.value.overtime,
    gross_pay: payrollPreview.value.gross,
    cash_advance: payrollPreview.value.totalCashAdvance,
    net_pay: payrollPreview.value.net,
    status: 'paid',
  })

  if (!error) {
    await (client.from('cash_advances') as any)
      .update({ status: 'deducted' })
      .eq('worker_id', payrollWorkerId.value)
      .eq('status', 'unpaid')

    await fetchPayrollHistory(payrollWorkerId.value)
    await fetchCashAdvances(payrollWorkerId.value)
    // Refresh work logs — paid ones will now be hidden
    await fetchWorkLogs(payrollWorkerId.value)
    showPayroll.value = false
    payrollPreview.value = null
    showSuccess('Payroll released! Paid logs moved to payroll history.')
  }
  computingPayroll.value = false
}


const openPayroll = async (workerId: string) => {
  payrollWorkerId.value = workerId
  payrollPreview.value = null
  payrollStart.value = ''
  payrollEnd.value = ''
  showPayroll.value = true
  computingPayroll.value = true

  const period = await getUnpaidWorkPeriod(workerId)

  if (period) {
    payrollStart.value = period.start
    payrollEnd.value = period.end
    await computePayroll()
    showSuccess(`Unpaid period: ${period.start} to ${period.end}`)
  } else {
    showSuccess('No unpaid work logs found.')
  }

  computingPayroll.value = false
}

const autoDetectPeriod = async () => {
  if (!payrollWorkerId.value) return
  computingPayroll.value = true
  const period = await getUnpaidWorkPeriod(payrollWorkerId.value)
  if (period) {
    payrollStart.value = period.start
    payrollEnd.value = period.end
    await computePayroll()
    showSuccess(`Detected: ${period.start} to ${period.end}`)
  } else {
    payrollPreview.value = null
    showSuccess('No unpaid work logs found.')
  }
  computingPayroll.value = false
}

// ─── Cash advance ─────────────────────────────────────────────────
const openCashAdvance = (workerId: string) => {
  caWorkerId.value = workerId
  caAmount.value = null
  caReason.value = ''
  showCashAdvance.value = true
}

const addCashAdvance = async () => {
  if (!caWorkerId.value || !caAmount.value) return
  const userId = await getUserId()
  if (!userId) return
  addingCA.value = true
  const { error } = await (client.from('cash_advances') as any).insert({
    worker_id: caWorkerId.value,
    user_id: userId,
    amount: caAmount.value,
    reason: caReason.value || null,
    status: 'unpaid',
  })
  if (!error) {
    await fetchCashAdvances(caWorkerId.value)
    showCashAdvance.value = false
    showSuccess('Cash advance recorded!')
  }
  addingCA.value = false
}

</script>

<template>
        <DeleteConfirmModal
                :show="showDeleteModal"
                title="Delete Worker"
                message="Are you sure you want to delete this worker? All their work and logs will be deleted as well."
                :loading="deletingWorker"
                @cancel="showDeleteModal = false"
                @confirm="deleteWorker"
              />
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <!-- Passcode Modals -->
      <PasscodeSetup 
        :show="showSetupModal" 
        @success="onSetupSuccess"
        @cancel="onCancel"
      />

      <PasscodeVerify 
        :show="showPasscodeModal" 
        @success="onVerifySuccess"
        @cancel="onCancel"
        @forgot="onForgotPasscode"
      />

      <PasscodeReset 
        :show="showResetModal" 
        @success="onResetSuccess"
        @cancel="onResetCancel"
      />

      <!-- Main Content - Only show when unlocked -->
      <div v-if="isUnlocked">
        <!-- ─── Create Worker Modal ─────────────────────── -->
        <Transition name="fade">
          <div v-if="showCreateWorker" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
            <Transition name="scale">
              <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div class="bg-green-600 px-6 py-5 flex items-center justify-between">
                  <div>
                    <h2 class="text-lg font-black text-white">Add Worker</h2>
                    <p class="text-green-100 text-xs mt-0.5">Fill in worker details</p>
                  </div>
                  <button @click="showCreateWorker = false" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                    <X :size="16" class="text-white" />
                  </button>
                </div>

                <div class="p-6 space-y-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name <span class="text-red-400">*</span></label>
                    <input v-model="newWorkerName" type="text" placeholder="e.g. Juan Dela Cruz"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Daily Rate <span class="text-red-400">*</span></label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                      <input v-model.number="newWorkerRate" type="number" min="1" placeholder="e.g. 550"
                        class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Regular Hours per Day</label>
                    <input v-model.number="newWorkerHours" type="number" min="1" max="24"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Pay Schedule</label>
                    <div class="grid grid-cols-2 gap-3">
                      <button type="button" @click="newWorkerSchedule = 'weekly'"
                        :class="['py-3 rounded-2xl border-2 text-sm font-semibold transition cursor-pointer',
                          newWorkerSchedule === 'weekly' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50']">
                        📅 Weekly
                      </button>
                      <button type="button" @click="newWorkerSchedule = 'kinsenas'"
                        :class="['py-3 rounded-2xl border-2 text-sm font-semibold transition cursor-pointer',
                          newWorkerSchedule === 'kinsenas' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50']">
                        📆 Kinsenas
                      </button>
                    </div>
                  </div>

                  <div v-if="newWorkerRate" class="bg-green-50 rounded-2xl p-4 border border-green-100">
                    <p class="text-xs text-green-700 font-semibold mb-2">Salary Preview</p>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p class="text-slate-400">Daily</p>
                        <p class="font-bold text-slate-700">{{ formatPeso(newWorkerRate) }}</p>
                      </div>
                      <div>
                        <p class="text-slate-400">{{ newWorkerSchedule === 'weekly' ? 'Weekly (7 days)' : 'Kinsenas (15 days)' }}</p>
                        <p class="font-bold text-slate-700">{{ formatPeso(newWorkerRate * (newWorkerSchedule === 'weekly' ? 7 : 15)) }}</p>
                      </div>
                    </div>
                  </div>

                  <div v-if="workerError" class="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                    {{ workerError }}
                  </div>

                  <div class="flex gap-3 pt-2">
                    <button @click="createWorker" :disabled="creatingWorker"
                      class="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer">
                      {{ creatingWorker ? 'Saving...' : 'Save Worker' }}
                    </button>
                    <button @click="showCreateWorker = false"
                      class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
            <div class="absolute inset-0 -z-10" @click="showCreateWorker = false" />
          </div>
        </Transition>

        <!-- ─── Add Work Log Modal (Multi-Day) ──────────── -->
        <Transition name="fade">
          <div v-if="showAddLog" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
            <Transition name="scale">
              <div class="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                <div class="bg-blue-600 px-6 py-5 flex items-center justify-between shrink-0">
                  <div>
                    <h2 class="text-lg font-black text-white">Log Work Days</h2>
                    <p class="text-blue-100 text-xs mt-0.5">
                      {{ getWorker(selectedWorkerId!)?.name }} — 
                      {{ getWorker(selectedWorkerId!)?.pay_schedule === 'weekly' ? 'Weekly' : 'Kinsenas' }} Schedule
                    </p>
                  </div>
                  <button @click="showAddLog = false" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                    <X :size="16" class="text-white" />
                  </button>
                </div>

                <div class="p-6 border-b border-slate-200 shrink-0">
                  <div class="flex flex-wrap gap-4 items-end">
                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1.5">Start Date</label>
                      <input v-model="logStartDate" type="date"
                        class="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    </div>

                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1.5">Number of Days</label>
                      <select v-model.number="logNumberOfDays"
                        class="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                        <option :value="7">7 Days (Weekly)</option>
                        <option :value="15">15 Days (Kinsenas)</option>
                        <option :value="1">1 Day</option>
                        <option :value="3">3 Days</option>
                        <option :value="5">5 Days</option>
                        <option :value="10">10 Days</option>
                      </select>
                    </div>

                    <div class="flex gap-2">
                      <button @click="markAllWorkDays"
                        class="px-3 py-2.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl text-xs font-semibold transition cursor-pointer">
                        <span>
                          <Check :size="14" class="inline-block" />
                        </span>
                        <span>
                           All Work Days
                        </span>
                       
                      </button>
                      
                      <button @click="setAllHours(getWorker(selectedWorkerId ?? '')?.regular_hours ?? 8)"
                        class="px-3 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-xs font-semibold transition cursor-pointer">
                        <span><RefreshCw :size="14" class="inline-block" /></span>
                        <span> Reset Hours</span>
                      </button>
                    </div>

                    <div class="ml-auto flex items-center gap-4 bg-blue-50 rounded-xl px-4 py-2.5">
                      <div class="text-center">
                        <p class="text-xs text-slate-500">Work Days</p>
                        <p class="text-lg font-bold text-blue-600">{{ totalWorkDays }}</p>
                      </div>
                      <div class="w-px h-8 bg-blue-200"></div>
                      <div class="text-center">
                        <p class="text-xs text-slate-500">Total Hours</p>
                        <p class="text-lg font-bold text-blue-600">{{ totalLogHours }}</p>
                      </div>
                      <div v-if="totalLogOvertime > 0" class="text-center">
                        <p class="text-xs text-slate-500">OT Hours</p>
                        <p class="text-lg font-bold text-orange-600">{{ totalLogOvertime }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex-1 overflow-y-auto p-6">
                  <div v-if="dayEntries.length === 0" class="text-center py-12 text-slate-400">
                    Please select a start date to generate the work schedule
                  </div>
                  
                  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div v-for="(entry, index) in dayEntries" :key="entry?.date || index"
                      :class="[
                        'rounded-2xl border-2 p-4 transition-all',
                        entry?.isWorkDay 
                          ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md' 
                          : 'bg-slate-50 border-slate-100 opacity-60'
                      ]">
                      
                      <div class="flex items-center justify-between mb-3">
                        <div>
                          <p class="text-sm font-bold text-slate-700">{{ entry?.dayName || '' }}</p>
                          <p class="text-xs text-slate-400">{{ entry?.date ? formatDateDisplay(entry.date) : '' }}</p>
                        </div>
                        <button @click="toggleWorkDay(index)"
                          :class="[
                            'w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer',
                            entry?.isWorkDay 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-red-100 text-red-400 hover:bg-red-200'
                          ]"
                          :title="entry?.isWorkDay ? 'Click to mark as day off' : 'Click to mark as work day'">
                          <span class="text-lg">{{ entry?.isWorkDay ? '✓' : '✕' }}</span>
                        </button>
                      </div>

                      <div class="space-y-2">
                        <div>
                          <label class="block text-xs text-slate-500 mb-1">Hours Worked</label>
                          <input 
                            v-model.number="entry.hoursWorked" 
                            type="number" 
                            min="0" 
                            max="24" 
                            step="0.5"
                            :disabled="!entry?.isWorkDay"
                            class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        </div>

                        <div>
                          <label class="block text-xs text-slate-500 mb-1">Overtime (hrs)</label>
                          <input 
                            v-model.number="entry.overtimeHours" 
                            type="number" 
                            min="0" 
                            max="12" 
                            step="0.5"
                            :disabled="!entry?.isWorkDay"
                            class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        </div>

                        <div>
                          <label class="block text-xs text-slate-500 mb-1">Notes</label>
                          <input 
                            v-model="entry.notes" 
                            type="text" 
                            placeholder="e.g. Half day, Late"
                            :disabled="!entry?.isWorkDay"
                            class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-300">
                        </div>
                      </div>

                      <div v-if="entry?.isWorkDay && entry.hoursWorked > 0" class="mt-3 pt-3 border-t border-slate-100">
                        <div class="text-xs space-y-1">
                          <div class="flex justify-between">
                            <span class="text-slate-400">Regular</span>
                            <span class="font-semibold text-slate-600">
                              {{ formatPeso((entry.hoursWorked / (getWorker(selectedWorkerId!)?.regular_hours ?? 8)) * (getWorker(selectedWorkerId!)?.rate ?? 0)) }}
                            </span>
                          </div>
                          <div v-if="entry.overtimeHours > 0" class="flex justify-between">
                            <span class="text-slate-400">OT (×1.25)</span>
                            <span class="font-semibold text-orange-600">
                              {{ formatPeso((entry.overtimeHours / (getWorker(selectedWorkerId!)?.regular_hours ?? 8)) * (getWorker(selectedWorkerId!)?.rate ?? 0) * 1.25) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="border-t border-slate-200 p-6 shrink-0">
                  <div class="flex gap-3">
                    <button @click="addWorkLog" :disabled="addingLog || totalWorkDays === 0"
                      class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2">
                      <Save :size="16" />
                      {{ addingLog ? 'Saving...' : `Save ${totalWorkDays} Work Day${totalWorkDays !== 1 ? 's' : ''}` }}
                    </button>
                    <button @click="showAddLog = false"
                      class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
            <div class="absolute inset-0 -z-10" @click="showAddLog = false" />
          </div>
        </Transition>

        <!-- ─── Payroll Modal with Auto-Detection ───────────────────────────── -->
        <Transition name="fade">
          <div v-if="showPayroll" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
            <Transition name="scale">
              <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div class="bg-yellow-500 px-6 py-5 flex items-center justify-between">
                  <div>
                    <h2 class="text-lg font-black text-white">Compute Payroll</h2>
                    <p class="text-yellow-100 text-xs mt-0.5">
                      {{ getWorker(payrollWorkerId!)?.name }} — 
                      <span class="font-semibold">{{ getWorker(payrollWorkerId!)?.pay_schedule === 'weekly' ? 'Weekly' : 'Kinsenas' }}</span>
                    </p>
                  </div>
                  <button @click="showPayroll = false; payrollPreview = null" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                    <X :size="16" class="text-white" />
                  </button>
                </div>

                <div class="p-6 space-y-4">
                  <!-- Period Selection with Auto-detect Button -->
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-semibold text-gray-700">Payroll Period</label>
                    <button 
                      @click="autoDetectPeriod"
                      class="text-xs text-yellow-600 hover:text-yellow-700 font-semibold flex items-center gap-1 transition cursor-pointer"
                      :disabled="computingPayroll">
                      <RefreshCw :size="12" :class="{ 'animate-spin': computingPayroll }" />
                      Auto-detect work period
                    </button>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-gray-500 mb-1.5">Period Start</label>
                      <input v-model="payrollStart" type="date"
                        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-500 mb-1.5">Period End</label>
                      <input v-model="payrollEnd" type="date"
                        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
                    </div>
                  </div>

                  <!-- Period Info Display -->
                  <div class="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <div class="flex items-center gap-2 text-xs text-blue-700">
                      <CalendarDays :size="14" />
                      <span class="font-semibold">Pay Schedule: </span>
                      <span>{{ getWorker(payrollWorkerId!)?.pay_schedule === 'weekly' ? 'Weekly (7 days)' : 'Kinsenas (15 days)' }}</span>
                    </div>
                    <div class="text-xs text-blue-600 mt-1">
                      Click "Auto-detect" to find work period
                    </div>
                  </div>

                  <button @click="computePayroll"
                    :disabled="!payrollStart || !payrollEnd || computingPayroll"
                    class="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2">
                    <RefreshCw :size="14" :class="{ 'animate-spin': computingPayroll }" />
                    {{ computingPayroll ? 'Computing...' : 'Compute Payroll' }}
                  </button>

                  <div v-if="payrollPreview" class="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                    <p class="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
                      <Banknote :size="16" class="text-yellow-500" />
                      Payroll Breakdown
                    </p>

                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-slate-500">Days Worked</span>
                        <span class="font-semibold text-slate-700">{{ payrollPreview.days }} days</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-500">Total Hours</span>
                        <span class="font-semibold text-slate-700">{{ payrollPreview.hours }} hrs</span>
                      </div>
                      <div v-if="payrollPreview.overtime > 0" class="flex justify-between">
                        <span class="text-slate-500">Overtime Hours</span>
                        <span class="font-semibold text-orange-600">{{ payrollPreview.overtime }} hrs</span>
                      </div>
                      <div class="flex justify-between pt-2 border-t border-slate-200">
                        <span class="text-slate-500">Gross Pay</span>
                        <span class="font-bold text-green-600">{{ formatPeso(payrollPreview.gross) }}</span>
                      </div>
                      <div v-if="payrollPreview.totalCashAdvance > 0" class="flex justify-between">
                        <span class="text-slate-500">Cash Advance Deduction</span>
                        <span class="font-bold text-red-500">- {{ formatPeso(payrollPreview.totalCashAdvance) }}</span>
                      </div>
                      <div class="flex justify-between pt-2 border-t border-slate-200">
                        <span class="font-black text-slate-700">NET PAY</span>
                        <span class="font-black text-2xl text-green-600">{{ formatPeso(payrollPreview.net) }}</span>
                      </div>
                    </div>

                    <button @click="savePayroll" :disabled="computingPayroll || payrollPreview.days === 0"
                      class="w-full py-3 mt-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-black text-sm transition cursor-pointer flex items-center justify-center gap-2">
                      <CheckCircle :size="14" />
                      {{ computingPayroll ? 'Processing...' : 'Release Salary' }}
                    </button>
                  </div>

                  <div v-if="payrollPreview && payrollPreview.days === 0 && !computingPayroll" 
                    class="text-center py-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <AlertCircle :size="20" class="text-yellow-600 mx-auto mb-2" />
                    <p class="text-yellow-700 text-sm font-semibold">No work logs found for this period</p>
                    <p class="text-yellow-600 text-xs mt-1">Please log work days first</p>
                  </div>
                </div>
              </div>
            </Transition>
            <div class="absolute inset-0 -z-10" @click="showPayroll = false; payrollPreview = null" />
          </div>
        </Transition>

        <!-- ─── Cash Advance Modal ─────────────────────── -->
        <Transition name="fade">
          <div v-if="showCashAdvance" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
            <Transition name="scale">
              <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div class="bg-red-500 px-6 py-5 flex items-center justify-between">
                  <div>
                    <h2 class="text-lg font-black text-white">Cash Advance</h2>
                    <p class="text-red-100 text-xs mt-0.5">{{ getWorker(caWorkerId!)?.name }} — will be deducted on next payroll</p>
                  </div>
                  <button @click="showCashAdvance = false" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                    <X :size="16" class="text-white" />
                  </button>
                </div>

                <div class="p-6 space-y-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Amount <span class="text-red-400">*</span></label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                      <input v-model.number="caAmount" type="number" min="1" placeholder="e.g. 500"
                        class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Reason (optional)</label>
                    <input v-model="caReason" type="text" placeholder="e.g. Medical, Emergency"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                  </div>

                  <div class="bg-red-50 rounded-2xl p-4 border border-red-100">
                    <p class="text-xs text-red-600">⚠️ This amount will be automatically deducted from the next payroll computation.</p>
                  </div>

                  <div class="flex gap-3 pt-2">
                    <button @click="addCashAdvance" :disabled="addingCA || !caAmount"
                      class="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer">
                      {{ addingCA ? 'Saving...' : 'Record Cash Advance' }}
                    </button>
                    <button @click="showCashAdvance = false"
                      class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
            <div class="absolute inset-0 -z-10" @click="showCashAdvance = false" />
          </div>
        </Transition>

        <!-- ─── Main Content ───────────────────────────── -->
        <div class="p-4 sm:p-8 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Workers</h2>
              <p class="text-slate-500 text-xs sm:text-sm mt-1">Manage workers, attendance, and salary</p>
            </div>
            <button @click="showCreateWorker = true"
              class="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm transition cursor-pointer">
              <Plus :size="16" />
              Add Worker
            </button>
          </div>

          <Transition name="fade">
            <div v-if="successMsg" class="px-5 py-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-semibold flex items-center gap-2">
              <CheckCircle :size="16" />
              {{ successMsg }}
            </div>
          </Transition>

          <div v-if="workers.length === 0"
            class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
            <div class="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Users2 :size="28" class="text-green-600" />
            </div>
            <h3 class="font-bold text-slate-700 text-lg mb-2">No workers yet</h3>
            <p class="text-slate-400 text-sm mb-6">Add your first worker to start tracking attendance and salary</p>
            <button @click="showCreateWorker = true"
              class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm transition cursor-pointer">
              Add First Worker
            </button>
          </div>

          <div class="space-y-4">
            <div v-for="w in workers" :key="w.id"
              class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">

              <div class="p-5 sm:p-6">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-center gap-4 flex-1 min-w-0">
                    <div class="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-black text-lg shrink-0">
                      {{ w.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <h3 class="font-bold text-slate-800 text-base">{{ w.name }}</h3>
                      <div class="flex flex-wrap items-center gap-2 mt-1">
                        <span class="text-xs text-slate-400 flex items-center gap-1">
                          <Wallet :size="11" /> {{ formatPeso(w.rate) }}/day
                        </span>
                        <span class="text-xs text-slate-400 flex items-center gap-1">
                          <Clock :size="11" /> {{ w.regular_hours }}hrs
                        </span>
                        <span class="px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                          :class="w.pay_schedule === 'weekly' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'">
                          {{ w.pay_schedule === 'weekly' ? 'Weekly' : 'Kinsenas' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-if="totalUnpaidCA(w.id) > 0"
                    class="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-xl text-xs font-semibold shrink-0">
                    <AlertCircle :size="12" />
                    CA: {{ formatPeso(totalUnpaidCA(w.id)) }}
                  </div>
                </div>

                <div class="flex flex-wrap gap-2 mt-4">
                  <button @click="openAddLog(w.id)"
                    class="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                    <CalendarDays :size="13" /> Log Work Days
                  </button>
                  <button @click="openPayroll(w.id)"
                    class="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                    <Banknote :size="13" /> Compute Salary
                  </button>
                  <button @click="openCashAdvance(w.id)"
                    class="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                    <Wallet :size="13" /> Cash Advance
                  </button>
                  <button @click="openDeleteWorker(w.id)"
                    class="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition cursor-pointer">
                    <Trash2 :size="13" /> Remove
                  </button>
                  <button @click="toggleExpand(w.id)"
                    class="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition cursor-pointer ml-auto">
                    <component :is="expandedWorker === w.id ? ChevronUp : ChevronDown" :size="13" />
                    {{ expandedWorker === w.id ? 'Hide' : 'View' }} Details
                  </button>
                </div>
              </div>

        

              <Transition name="slide">
                <div v-if="expandedWorker === w.id" class="border-t border-slate-100">
                  <!-- Recent Work Logs with Paid/Unpaid Status -->
                  <div class="p-5 sm:p-6 border-b border-slate-100">
                    <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <CalendarDays :size="15" class="text-blue-500" /> Recent Work Logs
                    </h4>
                    <div v-if="!workLogs?.[w.id] || workLogs?.[w.id]?.length === 0"
                      class="text-xs text-slate-400 text-center py-4">No work logs yet</div>
                    <div v-else class="space-y-2">
                      <div v-for="log in workLogs[w.id]?.slice(0, 7)" :key="log.id"
                        class="flex items-center justify-between text-xs rounded-xl px-4 py-3"
                        :class="log.isPaid ? 'bg-green-50 border border-green-100' : 'bg-yellow-50 border border-yellow-100'">
                        <div class="flex items-center gap-3">
                          <span class="font-semibold text-slate-700">{{ formatDate(log.work_date) }}</span>
                          <span class="text-slate-600">{{ log.hours_worked }}hrs regular</span>
                          <span v-if="log.overtime_hrs > 0" class="text-orange-500 font-semibold">+{{ log.overtime_hrs }}hrs OT</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <span v-if="log.notes" class="text-slate-400 italic truncate max-w-24">{{ log.notes }}</span>
                          <span 
                            :class="[
                              'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                              log.isPaid ? 'bg-green-200 text-green-700' : 'bg-yellow-200 text-yellow-700'
                            ]">
                            {{ log.isPaid ? 'Paid' : 'Unpaid' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="p-5 sm:p-6 border-b border-slate-100">
                    <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Wallet :size="15" class="text-red-500" /> Cash Advances
                    </h4>
                    <div v-if="!cashAdvances?.[w.id] || cashAdvances?.[w.id]?.length === 0"
                      class="text-xs text-slate-400 text-center py-4">No cash advances</div>
                    <div v-else class="space-y-2">
                      <div v-for="ca in cashAdvances?.[w.id] ?? []" :key="ca.id"
                        class="flex items-center justify-between text-xs rounded-xl px-4 py-3"
                        :class="ca.status === 'unpaid' ? 'bg-red-50' : 'bg-slate-50'">
                        <div class="flex items-center gap-3">
                          <span class="font-bold" :class="ca.status === 'unpaid' ? 'text-red-600' : 'text-slate-500'">
                            {{ formatPeso(ca.amount) }}
                          </span>
                          <span v-if="ca.reason" class="text-slate-400 italic">{{ ca.reason }}</span>
                          <span class="text-slate-400">{{ formatDate(ca.created_at) }}</span>
                        </div>
                        <span :class="['px-2 py-0.5 rounded-lg text-[11px] font-semibold',
                          ca.status === 'unpaid' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700']">
                          {{ ca.status === 'unpaid' ? 'Unpaid' : 'Deducted' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="p-5 sm:p-6">
                    <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Banknote :size="15" class="text-yellow-500" /> Payroll History
                    </h4>
                    <div v-if="!payrollHistory[w.id]?.length"
                      class="text-xs text-slate-400 text-center py-4">No payroll records yet</div>
                    <div v-else class="space-y-2">
                      <div v-for="pay in payrollHistory[w.id] ?? []" :key="pay.id"
                        class="bg-slate-50 rounded-xl px-4 py-3 text-xs">
                        <div class="flex items-center justify-between mb-1.5">
                          <span class="font-semibold text-slate-700">
                            {{ formatDate(pay.period_start) }} — {{ formatDate(pay.period_end) }}
                          </span>
                          <span class="px-2 py-0.5 rounded-lg font-semibold bg-green-100 text-green-700">Paid</span>
                        </div>
                        <div class="flex flex-wrap gap-3 text-slate-500">
                          <span>{{ pay.days_worked }} days</span>
                          <span>Gross: <strong class="text-slate-700">{{ formatPeso(pay.gross_pay) }}</strong></span>
                          <span v-if="pay.cash_advance > 0">CA: <strong class="text-red-500">-{{ formatPeso(pay.cash_advance) }}</strong></span>
                          <span>Net: <strong class="text-green-600">{{ formatPeso(pay.net_pay) }}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Locked State -->
      <div v-else-if="!showSetupModal && !showPasscodeModal && !showResetModal" class="flex items-center justify-center h-[calc(100vh-80px)]">
        <div class="text-center">
          <Lock :size="64" class="text-gray-400 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Section Locked</h3>
          <p class="text-gray-500">Please enter the passcode to access Workers section</p>
        </div>
      </div>
      
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active, .scale-leave-active { transition: all 0.2s ease; }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.95); }
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>