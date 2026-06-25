import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type Transaction = {
  id: string
  gallon_type: string
  quantity: number
  price_per_piece: number
  total_amount: number
  amount_paid: number
  balance_due: number
  payment_status: string
  debtor_name: string | null
  debtor_phone: string | null
  status: string
  transaction_type: string
  reseller_qty: number | null
  reseller_price: number | null
  rider_id: string | null
  rider_name: string | null
  created_at: string
  paid_at: string | null
}

type Rider = {
  id: string
  name: string
}

type DebtPayment = {
  id: string
  transaction_id: string
  amount_paid: number
  paid_at: string
  note: string | null
}

interface NewDebtorEntry {
  name: string
  gallons: number
  amount: number
}

type Worker = {
  id: string
  name: string
  pay_type: 'fixed' | 'per_gallon' | 'fixed_plus_percent'
  rate: number | null
  daily_rate: number | null
  gallon_rate: number | null
  gallon_percent: number | null
  regular_hours: number
  pay_schedule: 'weekly' | 'kinsenas' | 'daily'
  is_active: boolean
  created_at: string
}

const GEMINI_MODEL = 'gemini-3.1-flash-lite'

const PH_OFFSET_MS = 8 * 60 * 60 * 1000

function phDayStartUTC(dateStr: string): Date {
  const parts = dateStr.split('-')
  const y = Number(parts[0] ?? 0)
  const m = Number(parts[1] ?? 1)
  const d = Number(parts[2] ?? 1)
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0) - PH_OFFSET_MS)
}

function phDayEndUTC(dateStr: string): Date {
  const parts = dateStr.split('-')
  const y = Number(parts[0] ?? 0)
  const m = Number(parts[1] ?? 1)
  const d = Number(parts[2] ?? 1)
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - PH_OFFSET_MS)
}

function todayPhDateStr(): string {
  const now = new Date(Date.now() + PH_OFFSET_MS)
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
}

function formatPeso(amount: number): string {
  return `₱${amount.toFixed(2)}`
}

function cleanResponse(text: string): string {
  if (!text) return text
  
  let cleaned = text
  
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1')
  cleaned = cleaned.replace(/\*/g, '')
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
  cleaned = cleaned.replace(/[\u{2600}-\u{27BF}]/gu, '')
  cleaned = cleaned.replace(/[\u{1F700}-\u{1F77F}]/gu, '')
  cleaned = cleaned.replace(/[\u{1F780}-\u{1F7FF}]/gu, '')
  cleaned = cleaned.replace(/[\u{1F800}-\u{1F8FF}]/gu, '')
  cleaned = cleaned.replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
  cleaned = cleaned.replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
  cleaned = cleaned.replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
  
  cleaned = cleaned.replace(/(\d+\.)\s*/g, '\n$1 ')
  cleaned = cleaned.replace(/(•)\s*/g, '\n$1 ')
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  cleaned = cleaned.trim()
  
  return cleaned
}

// ============================================================
// EXISTING TOOL IMPLEMENTATIONS (unchanged)
// ============================================================

async function getSalesSummary(
  client: any,
  userId: string,
  startDate: string,
  endDate: string
) {
  if (!userId) {
    return {
      error: 'User not authenticated',
      summary_text: 'Unable to fetch sales data - user not authenticated.'
    }
  }

  const start = phDayStartUTC(startDate)
  const end = phDayEndUTC(endDate)

  const { data: txs, error: txsError } = await client
    .from('transactions')
    .select('id, total_amount, quantity, payment_status, balance_due, created_at, debtor_name, amount_paid')
    .eq('user_id', userId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  if (txsError) {
    return {
      error: txsError.message,
      summary_text: `Error fetching sales data: ${txsError.message}`
    }
  }

  const { data: payments, error: paymentsError } = await client
    .from('debt_payments')
    .select('amount_paid, paid_at, transaction_id')
    .eq('user_id', userId)
    .gte('paid_at', start.toISOString())
    .lte('paid_at', end.toISOString())

  const allTx: Transaction[] = txs || []
  const allPayments: DebtPayment[] = payments || []

  const grossSales = allTx.reduce((sum: number, t: Transaction) => sum + Number(t.total_amount), 0)
  const totalGallons = allTx.reduce((sum: number, t: Transaction) => sum + Number(t.quantity), 0)
  const totalCollected = allPayments.reduce((sum: number, p: DebtPayment) => sum + Number(p.amount_paid), 0)
  const unpaidFromThisPeriod = allTx
    .filter((t: Transaction) => t.payment_status === 'utang' || t.payment_status === 'partial')
    .reduce((sum: number, t: Transaction) => sum + Number(t.balance_due), 0)
  const paidFromThisPeriod = allTx
    .filter((t: Transaction) => t.payment_status === 'paid' || t.payment_status === 'regular')
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount_paid), 0)
  const fullyPaidTransactions = allTx.filter(
    (t: Transaction) => t.payment_status === 'paid' || t.payment_status === 'regular'
  ).length
  const debtTransactions = allTx.filter(
    (t: Transaction) => t.payment_status === 'utang' || t.payment_status === 'partial'
  ).length

  return {
    date_range: { start: startDate, end: endDate },
    gross_sales: Number(grossSales.toFixed(2)),
    total_gallons_sold: totalGallons,
    total_transactions: allTx.length,
    fully_paid_transactions: fullyPaidTransactions,
    debt_transactions: debtTransactions,
    paid_on_sale_date: Number(paidFromThisPeriod.toFixed(2)),
    unpaid_balance_from_this_period: Number(unpaidFromThisPeriod.toFixed(2)),
    collections_received_in_period: Number(totalCollected.toFixed(2)),
    collection_transactions: allPayments.length,
    summary_text: `Sales Summary for ${startDate} to ${endDate}:
Gross Sales: ${formatPeso(grossSales)} from ${allTx.length} transactions
- ${fullyPaidTransactions} transactions fully paid on sale date: ${formatPeso(paidFromThisPeriod)}
- ${debtTransactions} transactions with unpaid balance: ${formatPeso(unpaidFromThisPeriod)}
Collections Received: ${formatPeso(totalCollected)} from ${allPayments.length} payments
Gallons Sold: ${totalGallons}`
  }
}

async function getTodaySales(client: any, userId: string) {
  if (!userId) {
    return {
      error: 'User not authenticated',
      formatted_summary: 'Unable to fetch today\'s sales - user not authenticated.'
    }
  }

  const today = todayPhDateStr()
  const start = phDayStartUTC(today)
  const end = phDayEndUTC(today)
  
  const { data: txs, error } = await client
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
  
  if (error) {
    return { 
      error: error.message,
      formatted_summary: `Error fetching today's sales: ${error.message}`
    }
  }
  
  const allTx: Transaction[] = txs || []
  
  const { data: payments } = await client
    .from('debt_payments')
    .select('amount_paid, paid_at, transaction_id')
    .eq('user_id', userId)
    .gte('paid_at', start.toISOString())
    .lte('paid_at', end.toISOString())
  
  const allPayments: DebtPayment[] = payments || []
  const totalCollectionsToday = allPayments.reduce((sum: number, p: DebtPayment) => sum + Number(p.amount_paid), 0)
  
  const grossSalesToday = allTx.reduce((sum: number, t: Transaction) => sum + Number(t.total_amount), 0)
  const totalGallonsToday = allTx.reduce((sum: number, t: Transaction) => sum + Number(t.quantity), 0)
  const paidToday = allTx
    .filter((t: Transaction) => t.payment_status === 'paid' || t.payment_status === 'regular')
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount_paid), 0)
  const unpaidToday = allTx
    .filter((t: Transaction) => t.payment_status === 'utang' || t.payment_status === 'partial')
    .reduce((sum: number, t: Transaction) => sum + Number(t.balance_due), 0)
  const paidCount = allTx.filter((t: Transaction) => t.payment_status === 'paid' || t.payment_status === 'regular').length
  const debtCount = allTx.filter((t: Transaction) => t.payment_status === 'utang' || t.payment_status === 'partial').length
  
  return {
    date: today,
    sales_count: allTx.length,
    gross_sales_today: Number(grossSalesToday.toFixed(2)),
    total_gallons_today: totalGallonsToday,
    paid_on_sale_date: Number(paidToday.toFixed(2)),
    unpaid_from_todays_sales: Number(unpaidToday.toFixed(2)),
    paid_transactions_today: paidCount,
    debt_transactions_today: debtCount,
    collections_received_today: Number(totalCollectionsToday.toFixed(2)),
    collection_payments_today: allPayments.length,
    total_cash_today: Number((totalCollectionsToday + paidToday).toFixed(2)),
    formatted_summary: `Today's Report (${today}):
New Sales: ${allTx.length} transactions totaling ${formatPeso(grossSalesToday)} from ${totalGallonsToday} gallons
- Paid on sale: ${formatPeso(paidToday)} (${paidCount} transactions)
- Unpaid balance: ${formatPeso(unpaidToday)} (${debtCount} transactions)
Collections Received Today: ${formatPeso(totalCollectionsToday)} from ${allPayments.length} payments
Total Cash Received Today: ${formatPeso(totalCollectionsToday + paidToday)}`
  }
}

async function getTopDebtors(client: any, userId: string, limit: number) {
  if (!userId) {
    return []
  }

  const { data: debtors } = await client
    .from('debtor_details')
    .select('*')
    .eq('user_id', userId)
    .neq('payment_status', 'paid')
    .order('balance_due', { ascending: false })
    .limit(limit)

  if (!debtors || debtors.length === 0) {
    return { message: 'No outstanding debts found.' }
  }

  return (debtors || []).map((d: any) => ({
    debtor_name: d.debtor_name || 'Unnamed customer',
    total_owed: Number(d.balance_due),
    amount_paid: Number(d.amount_paid),
    original_amount: Number(d.amount),
    status: d.payment_status
  }))
}

// ============================================================
// NEW TOOL 1: Detailed debtor lookup (search by name, or list all,
// not just "top N" — covers debtor_details fully)
// ============================================================

async function getDebtorDetails(
  client: any,
  userId: string,
  debtorName: string | null,
  includeFullyPaid: boolean
) {
  if (!userId) {
    return { error: 'User not authenticated' }
  }

  let query = client
    .from('debtor_details')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!includeFullyPaid) {
    query = query.neq('payment_status', 'paid')
  }
  if (debtorName) {
    query = query.ilike('debtor_name', `%${debtorName}%`)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  const debtors = data || []
  const totalOwed = debtors
    .filter((d: any) => d.payment_status !== 'paid')
    .reduce((s: number, d: any) => s + Number(d.balance_due), 0)

  return {
    matched_count: debtors.length,
    total_outstanding: Number(totalOwed.toFixed(2)),
    debtors: debtors.map((d: any) => ({
      debtor_name: d.debtor_name || 'Unnamed customer',
      original_amount: Number(d.amount),
      gallons: d.gallons,
      amount_paid: Number(d.amount_paid),
      balance_due: Number(d.balance_due),
      status: d.payment_status,
      note: d.note,
      date: d.created_at,
      transaction_id: d.transaction_id
    }))
  }
}

// ============================================================
// NEW TOOL 2: Riders — list with per-rider performance (gallons,
// revenue, transaction count) over an optional date range
// ============================================================

async function getRidersSummary(
  client: any,
  userId: string,
  startDate: string | null,
  endDate: string | null
) {
  if (!userId) {
    return { error: 'User not authenticated' }
  }

  const { data: riders, error: ridersError } = await client
    .from('delivery_riders')
    .select('id, name, phone, is_active, created_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (ridersError) {
    return { error: ridersError.message }
  }

  let txQuery = client
    .from('transactions')
    .select('rider_id, rider_name, total_amount, quantity, payment_status, balance_due, created_at')
    .eq('user_id', userId)
    .not('rider_id', 'is', null)

  if (startDate) txQuery = txQuery.gte('created_at', phDayStartUTC(startDate).toISOString())
  if (endDate) txQuery = txQuery.lte('created_at', phDayEndUTC(endDate).toISOString())

  const { data: riderTxs, error: txError } = await txQuery

  if (txError) {
    return { error: txError.message }
  }

  const txs: any[] = riderTxs || []

  const riderStats = (riders || []).map((r: any) => {
    const theirTxs = txs.filter((t) => t.rider_id === r.id)
    const revenue = theirTxs.reduce((s, t) => s + Number(t.total_amount), 0)
    const gallons = theirTxs.reduce((s, t) => s + Number(t.quantity), 0)
    const unpaid = theirTxs
      .filter((t) => t.payment_status === 'utang' || t.payment_status === 'partial')
      .reduce((s, t) => s + Number(t.balance_due), 0)
    return {
      rider_name: r.name,
      phone: r.phone,
      transaction_count: theirTxs.length,
      revenue_generated: Number(revenue.toFixed(2)),
      gallons_delivered: gallons,
      unpaid_balance_from_their_deliveries: Number(unpaid.toFixed(2))
    }
  })

  const unassignedTxs = txs.filter((t) => !t.rider_id)

  return {
    date_range: startDate && endDate ? { start: startDate, end: endDate } : 'all_time',
    rider_count: riderStats.length,
    riders: riderStats,
    unassigned_transaction_count: unassignedTxs.length
  }
}

// ============================================================
// NEW TOOL 3: Workers — pay type, schedule, current cash advance
// balance, and recent unpaid work logs
// ============================================================

async function getWorkersSummary(client: any, userId: string, workerName: string | null) {
  if (!userId) {
    return { error: 'User not authenticated' }
  }

  let query = client
    .from('workers')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (workerName) {
    query = query.ilike('name', `%${workerName}%`)
  }

  const { data: workers, error } = await query

  if (error) {
    return { error: error.message }
  }

  const workerList: Worker[] = workers || []

  const results = await Promise.all(
    workerList.map(async (w) => {
      const { data: advances } = await client
        .from('cash_advances')
        .select('amount, status')
        .eq('worker_id', w.id)
        .eq('status', 'unpaid')

      const unpaidCA = (advances || []).reduce((s: number, a: any) => s + Number(a.amount), 0)

      const { data: logs } = await client
        .from('work_logs')
        .select('work_date, hours_worked, overtime_hrs, gallons_delivered')
        .eq('worker_id', w.id)
        .order('work_date', { ascending: false })
        .limit(10)

      const payRateDisplay =
        w.pay_type === 'fixed'
          ? `${formatPeso(w.rate ?? w.daily_rate ?? 0)}/day`
          : w.pay_type === 'per_gallon'
            ? `${formatPeso(w.gallon_rate ?? 0)}/gallon`
            : `${formatPeso(w.daily_rate ?? w.rate ?? 0)}/day + ${w.gallon_percent ?? 0}% per gallon`

      return {
        worker_name: w.name,
        pay_type: w.pay_type,
        pay_rate: payRateDisplay,
        pay_schedule: w.pay_schedule,
        regular_hours_per_day: w.regular_hours,
        unpaid_cash_advance: Number(unpaidCA.toFixed(2)),
        recent_unpaid_work_logs: (logs || []).map((l: any) => ({
          date: l.work_date,
          hours: l.hours_worked,
          overtime_hours: l.overtime_hrs,
          gallons_delivered: l.gallons_delivered
        }))
      }
    })
  )

  return {
    worker_count: results.length,
    workers: results
  }
}

// ============================================================
// NEW TOOL 4: Payroll history / pending payroll for a worker
// ============================================================

async function getPayrollSummary(client: any, userId: string, workerName: string | null) {
  if (!userId) {
    return { error: 'User not authenticated' }
  }

  let workerQuery = client
    .from('workers')
    .select('id, name')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (workerName) {
    workerQuery = workerQuery.ilike('name', `%${workerName}%`)
  }

  const { data: workers, error: workersError } = await workerQuery

  if (workersError) {
    return { error: workersError.message }
  }

  if (!workers || workers.length === 0) {
    return { message: workerName ? `No worker found matching "${workerName}".` : 'No workers found.' }
  }

  const results = await Promise.all(
    workers.map(async (w: any) => {
      const { data: payroll } = await client
        .from('payroll')
        .select('period_start, period_end, days_worked, total_hours, gross_pay, cash_advance, net_pay, status, created_at')
        .eq('worker_id', w.id)
        .order('created_at', { ascending: false })
        .limit(10)

      const totalNetPaidAllTime = (payroll || []).reduce((s: number, p: any) => s + Number(p.net_pay), 0)

      return {
        worker_name: w.name,
        total_net_paid_all_time: Number(totalNetPaidAllTime.toFixed(2)),
        recent_payroll_records: (payroll || []).map((p: any) => ({
          period: `${p.period_start} to ${p.period_end}`,
          days_worked: p.days_worked,
          total_hours: p.total_hours,
          gross_pay: Number(p.gross_pay),
          cash_advance_deducted: Number(p.cash_advance),
          net_pay: Number(p.net_pay)
        }))
      }
    })
  )

  return { workers: results }
}

// ============================================================
// NEW TOOL 5: Unpaid balances across the whole business — utang +
// partial transactions, aggregated, not just top debtors
// ============================================================

async function getUnpaidBalances(client: any, userId: string) {
  if (!userId) {
    return { error: 'User not authenticated' }
  }

  const { data: txs, error } = await client
    .from('transactions')
    .select('id, debtor_name, total_amount, amount_paid, balance_due, payment_status, rider_name, created_at')
    .eq('user_id', userId)
    .in('payment_status', ['utang', 'partial'])
    .order('balance_due', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  const allTx: any[] = txs || []
  const totalUnpaid = allTx.reduce((s, t) => s + Number(t.balance_due), 0)
  const utangCount = allTx.filter((t) => t.payment_status === 'utang').length
  const partialCount = allTx.filter((t) => t.payment_status === 'partial').length

  return {
    total_unpaid_balance: Number(totalUnpaid.toFixed(2)),
    total_unpaid_transactions: allTx.length,
    fully_unpaid_utang_count: utangCount,
    partially_paid_count: partialCount,
    transactions: allTx.slice(0, 20).map((t) => ({
      debtor_name: t.debtor_name || 'Unnamed customer',
      total_amount: Number(t.total_amount),
      amount_paid: Number(t.amount_paid),
      balance_due: Number(t.balance_due),
      status: t.payment_status,
      rider_name: t.rider_name,
      date: t.created_at
    }))
  }
}

// ============================================================
// NEW TOOL 6: Subscription / plan status from profiles
//
// Matches the real schema used by Subscription.vue:
// profiles columns are plan, subscription_status, next_payment_date,
// setup_fee_paid — there is NO expires_at column. Days-remaining and
// expired/active status are derived from next_payment_date the same
// way Subscription.vue's `daysRemaining`/`isExpired` computed values do.
// ============================================================

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

async function getSubscriptionStatus(client: any, userId: string) {
  if (!userId) {
    return { error: 'User not authenticated' }
  }

  const { data, error } = await client
    .from('profiles')
    .select('plan, subscription_status, next_payment_date, setup_fee_paid')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    return { error: error.message }
  }

  if (!data) {
    return { message: 'No subscription profile found for this account.' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const nextPaymentDate = data?.next_payment_date ? new Date(data.next_payment_date + 'T00:00:00') : null
  const daysRemaining = nextPaymentDate
    ? Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const isExpired =
    data?.subscription_status === 'expired' || (daysRemaining !== null && daysRemaining <= 0)

  // Payment history, same path Subscription.vue uses: subscriptions -> subscription_payments
  let recentPayments: Array<{ amount: number; paid_at: string; due_date: string }> = []
  const { data: sub } = await client
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (sub?.id) {
    const { data: pays } = await client
      .from('subscription_payments')
      .select('amount_paid, paid_at, due_date')
      .eq('subscription_id', sub.id)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })
      .limit(5)

    recentPayments = (pays || []).map((p: any) => ({
      amount: Number(p.amount_paid),
      paid_at: p.paid_at,
      due_date: p.due_date
    }))
  }

  const plan = data?.plan ?? 'unknown'

  return {
    plan,
    subscription_status: data?.subscription_status ?? 'unknown',
    setup_fee_paid: Boolean(data?.setup_fee_paid),
    setup_fee_amount: SETUP_FEE[plan] ?? null,
    monthly_fee_amount: MONTHLY_FEE[plan] ?? null,
    next_payment_date: data?.next_payment_date ?? null,
    is_expired: isExpired,
    days_remaining: daysRemaining,
    recent_payments: recentPayments
  }
}

// ============================================================
// NEW TOOL 7: General business report over a date range —
// combines sales, collections, debts, riders, and worker payroll
// into one rollup (for "give me a report" type questions)
// ============================================================

async function getBusinessReport(
  client: any,
  userId: string,
  startDate: string,
  endDate: string
) {
  if (!userId) {
    return { error: 'User not authenticated' }
  }

  const start = phDayStartUTC(startDate)
  const end = phDayEndUTC(endDate)

  const [txResult, paymentsResult, payrollResult] = await Promise.all([
    client
      .from('transactions')
      .select('total_amount, quantity, payment_status, balance_due, rider_id, created_at')
      .eq('user_id', userId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString()),
    client
      .from('debt_payments')
      .select('amount_paid, paid_at')
      .eq('user_id', userId)
      .gte('paid_at', start.toISOString())
      .lte('paid_at', end.toISOString()),
    client
      .from('payroll')
      .select('net_pay, created_at')
      .eq('user_id', userId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
  ])

  if (txResult.error) return { error: txResult.error.message }

  const txs: any[] = txResult.data || []
  const payments: any[] = paymentsResult.data || []
  const payrollRecords: any[] = payrollResult.data || []

  const grossSales = txs.reduce((s, t) => s + Number(t.total_amount), 0)
  const totalGallons = txs.reduce((s, t) => s + Number(t.quantity), 0)
  const totalCollected = payments.reduce((s, p) => s + Number(p.amount_paid), 0)
  const unpaidBalance = txs
    .filter((t) => t.payment_status === 'utang' || t.payment_status === 'partial')
    .reduce((s, t) => s + Number(t.balance_due), 0)
  const totalPayroll = payrollRecords.reduce((s, p) => s + Number(p.net_pay), 0)
  const ridersInvolved = new Set(txs.filter((t) => t.rider_id).map((t) => t.rider_id)).size

  return {
    date_range: { start: startDate, end: endDate },
    gross_sales: Number(grossSales.toFixed(2)),
    total_gallons_sold: totalGallons,
    total_transactions: txs.length,
    collections_received: Number(totalCollected.toFixed(2)),
    unpaid_balance_outstanding: Number(unpaidBalance.toFixed(2)),
    payroll_paid_out: Number(totalPayroll.toFixed(2)),
    net_cash_position: Number((totalCollected - totalPayroll).toFixed(2)),
    riders_with_deliveries: ridersInvolved,
    summary_text: `Business Report (${startDate} to ${endDate}):
Gross Sales: ${formatPeso(grossSales)} (${txs.length} transactions, ${totalGallons} gallons)
Collections Received: ${formatPeso(totalCollected)}
Unpaid Balance Outstanding: ${formatPeso(unpaidBalance)}
Payroll Paid Out: ${formatPeso(totalPayroll)}
Net Cash Position: ${formatPeso(totalCollected - totalPayroll)}
Riders with deliveries this period: ${ridersInvolved}`
  }
}

// ============================================================
// Chat session helpers (unchanged)
// ============================================================

async function getOrCreateSession(client: any, userId: string) {
  const { data: existingSession } = await client
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingSession) {
    return existingSession
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const { data: newSession, error } = await client
    .from('chat_sessions')
    .insert({
      user_id: userId,
      expires_at: expiresAt.toISOString(),
      is_active: true
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating chat session:', error)
    throw error
  }

  return newSession
}

async function getSessionMessages(client: any, sessionId: string) {
  const { data: messages } = await client
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(20)

  return messages || []
}

async function saveMessage(client: any, sessionId: string, role: string, content: string) {
  const { error } = await client
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role: role,
      content: content
    })

  if (error) {
    console.error('Error saving message:', error)
  }
}

async function updateSessionActivity(client: any, sessionId: string) {
  await client
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId)
}

// ============================================================
// Tool declarations
// ============================================================

const getSalesSummaryDeclaration: FunctionDeclaration = {
  name: 'get_sales_summary',
  description: 'Get complete sales summary for a date range including gross sales, collections received, and unpaid balances.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      start_date: { type: Type.STRING, description: 'Start date, YYYY-MM-DD' },
      end_date: { type: Type.STRING, description: 'End date, YYYY-MM-DD (inclusive)' }
    },
    required: ['start_date', 'end_date']
  }
}

const getTodaySalesDeclaration: FunctionDeclaration = {
  name: 'get_today_sales',
  description: 'Get today\'s complete report showing new sales, collections received today, and debt payments.',
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
}

const getTopDebtorsDeclaration: FunctionDeclaration = {
  name: 'get_top_debtors',
  description: 'Get the customers/debtors who currently owe the most money with unpaid balances.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      limit: { type: Type.NUMBER, description: 'How many debtors to return, default 5' }
    }
  }
}

const getDebtorDetailsDeclaration: FunctionDeclaration = {
  name: 'get_debtor_details',
  description: 'Search and get detailed debtor records, optionally filtered by debtor name. Use this when the user asks about a SPECIFIC named debtor, or wants the full list of debtors rather than just the top few.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      debtor_name: { type: Type.STRING, description: 'Optional partial or full debtor name to search for. Omit to get all debtors.' },
      include_fully_paid: { type: Type.BOOLEAN, description: 'Whether to include debtors who have already fully paid. Default false.' }
    }
  }
}

const getRidersSummaryDeclaration: FunctionDeclaration = {
  name: 'get_riders_summary',
  description: 'Get all delivery riders with their performance: revenue generated, gallons delivered, transaction count, and unpaid balances from their deliveries. Optionally scoped to a date range.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      start_date: { type: Type.STRING, description: 'Optional start date, YYYY-MM-DD' },
      end_date: { type: Type.STRING, description: 'Optional end date, YYYY-MM-DD' }
    }
  }
}

const getWorkersSummaryDeclaration: FunctionDeclaration = {
  name: 'get_workers_summary',
  description: 'Get workers (staff, not delivery riders) including their pay type, pay rate, pay schedule, unpaid cash advances, and recent unpaid work logs. Optionally filtered by worker name.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      worker_name: { type: Type.STRING, description: 'Optional partial or full worker name to search for. Omit to get all workers.' }
    }
  }
}

const getPayrollSummaryDeclaration: FunctionDeclaration = {
  name: 'get_payroll_summary',
  description: 'Get payroll history for workers, including gross pay, cash advance deductions, and net pay per period. Use when asked about salary history, how much a worker was paid, or payroll records.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      worker_name: { type: Type.STRING, description: 'Optional worker name to filter to a single worker. Omit for all workers.' }
    }
  }
}

const getUnpaidBalancesDeclaration: FunctionDeclaration = {
  name: 'get_unpaid_balances',
  description: 'Get a full breakdown of all unpaid/utang and partially-paid transactions across the whole business, with total outstanding balance. Use for broad questions about total unpaid money, not for a single named debtor.',
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
}

const getSubscriptionStatusDeclaration: FunctionDeclaration = {
  name: 'get_subscription_status',
  description: 'Get the current logged-in user\'s own Hydrix subscription: plan, status, setup fee paid status, next payment due date, whether it is expired or expiring soon, and recent payment history.',
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
}

const getBusinessReportDeclaration: FunctionDeclaration = {
  name: 'get_business_report',
  description: 'Get a complete business report for a date range combining sales, collections, unpaid balances, payroll paid out, and net cash position. Use for broad "give me a report" or "how is my business doing" style questions covering multiple areas at once.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      start_date: { type: Type.STRING, description: 'Start date, YYYY-MM-DD' },
      end_date: { type: Type.STRING, description: 'End date, YYYY-MM-DD (inclusive)' }
    },
    required: ['start_date', 'end_date']
  }
}

const tools = [
  {
    functionDeclarations: [
      getSalesSummaryDeclaration,
      getTodaySalesDeclaration,
      getTopDebtorsDeclaration,
      getDebtorDetailsDeclaration,
      getRidersSummaryDeclaration,
      getWorkersSummaryDeclaration,
      getPayrollSummaryDeclaration,
      getUnpaidBalancesDeclaration,
      getSubscriptionStatusDeclaration,
      getBusinessReportDeclaration
    ]
  }
]

function buildSystemInstruction(isAuthenticated: boolean) {
  if (isAuthenticated) {
    return `You are a friendly business assistant for Hydrix Water Station System in the Philippines.

You have access to the user's full business data: sales, debtors, riders, workers, payroll, unpaid balances, and their own subscription status. Use the tools to get real data.

CRITICAL RULES:
1. ALWAYS use get_today_sales for "today" or "today's sales"
2. ALWAYS use get_sales_summary for date ranges like "this week", "this month"
3. ALWAYS use get_top_debtors for quick "who owes me the most" questions; use get_debtor_details when a SPECIFIC debtor is named or a full list is requested
4. ALWAYS use get_unpaid_balances for broad "how much utang total" questions across the whole business
5. ALWAYS use get_riders_summary for questions about delivery riders, their performance, or deliveries
6. ALWAYS use get_workers_summary for questions about staff/workers, their pay setup, or cash advances
7. ALWAYS use get_payroll_summary for questions about salary history or how much a worker was paid
8. ALWAYS use get_subscription_status for questions about the user's own Hydrix plan, payment status, next payment due date, or payment history
9. ALWAYS use get_business_report for broad "how is my business doing" or multi-area report requests
10. NEVER answer from memory - always call a tool first
11. Today's date is ${todayPhDateStr()}
12. Format amounts as "₱XX.XX"

FORMATTING RULES FOR DISPLAYING DATA:
- ALWAYS put each list item on a NEW LINE with a line break between items.
- When showing multiple items (debtors, plans, transactions, riders, workers), use numbered lists with each item on its own line.
- Example format for debtors (each on new line):
  1. Juan Dela Cruz - ₱1,500.00 (Partial)
  2. Maria Santos - ₱1,200.00 (Utang)
  3. Pedro Reyes - ₱800.00 (Partial)

- For pricing plans, use numbered list with each on new line:
  1. Basic Plan: ₱299/month - Essential features for small stations
  2. Standard Plan: ₱499/month - Full features including debt tracking
  3. Premium Plan: ₱699/month - Advanced analytics and rider management

- Keep responses clean, organized, and easy to read
- Use bold text for key information: **Juan Dela Cruz**, **₱1,500.00**
- Do not use any emojis or symbols
- Keep responses professional and conversational

When answering:
- Clearly separate "New Sales" from "Collections"
- Explain that collections can come from older debts
- Be conversational but accurate`
  } else {
    return `You are a sales representative for Hydrix Water Station System. Your goal is to inform potential customers about the system and encourage them to sign up.

ABOUT HYDRYX:
Hydrix is a smart water station dispensing system that provides clean, affordable drinking water 24/7. It offers quick, cashless, and eco-friendly solutions trusted by over 2,000 happy customers.

KEY FEATURES:
• Quick Dispense with instant shutoff
• Cash or QR payment options
• Real-time transaction tracking
• Smart Auto-Close to prevent spills
• Real-Time Analytics dashboard
• Different pricing plans for individuals and businesses

PRICING PLANS - Use numbered list format with each plan on a new line:
1. Basic Plan: ₱299 per month - Ideal for small households and beginner entrepreneurs. Includes ₱2,499 setup fee for system only.
2. Standard Plan: ₱499 per month - Complete vending system with automatic store gallon sales tracking and inventory management. Includes ₱4,999 setup fee for system only.
3. Premium Plan: ₱499 per month - Full software and hardware integration for large-scale operations. Includes Premium Support.

HOW TO AVAIL:
1. Create Account - Sign up for free and log in to access your personalized dashboard (takes less than 2 minutes)
2. Select Volume - Choose 1, 3, or 5 gallons with smart timer and auto shutoff
3. Pay and Collect - Cash or digital payment with instant transaction recording

CONTACT INFORMATION:
• Email: hydrixSolution@gmail.com
• Facebook: Hydrix Solution Water Station
• Phone: 09277462797
• Developer Owner: Edgar Jugado

LANGUAGE GUIDELINES:
You can respond in Tagalog or English depending on the user's language
When responding in Tagalog, use proper Tagalog grammar and be respectful (po and opo)

FORMATTING RULES FOR DISPLAYING DATA:
- ALWAYS put each list item on a NEW LINE with a line break between items.
- When showing multiple items (plans, features, debtors), use numbered lists or bullet points with each on its own line
- Use bold text for key information
- Keep responses clean, organized, and easy to read
- Do not use any emojis or symbols
- Keep responses professional and conversational

When answering questions:
Be professional and helpful
Highlight the benefits of the system
Ask if they want to know more about specific features
Encourage them to sign up or request a demo
If they ask about pricing, always include the plans in the numbered list format above with each on a new line
If they ask how to avail, give clear steps
Respond in the same language the user used (Tagalog or English)`
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'AI is not configured on this server.' })
  }

  const user = await serverSupabaseUser(event)
  let userId: string | null = null
  let isAuthenticated = false

  if (user) {
    userId = user.id || (user as any).sub || null
    if (userId) {
      isAuthenticated = true
    }
  }



  const body = await readBody<{ 
    message: string; 
    history?: ChatMessage[];
    isAuthenticated?: boolean 
  }>(event)
  
  const userMessage = (body?.message || '').trim()
  if (!userMessage) {
    throw createError({ statusCode: 400, statusMessage: 'Message is required.' })
  }
  
  const client = await serverSupabaseClient(event)

  let sessionId: string | null = null
  let savedHistory: ChatMessage[] = []

  if (isAuthenticated && userId) {
    try {
      const session = await getOrCreateSession(client, userId)
      sessionId = session.id

      const savedMessages = await getSessionMessages(client, session.id)
      savedHistory = savedMessages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))

      await updateSessionActivity(client, session.id)
    } catch (error) {
      console.error('Error managing chat session:', error)
    }
  }

  const allHistory = [...savedHistory, ...(Array.isArray(body?.history) ? body.history : [])]
  const history = allHistory.slice(-20)

  const ai = new GoogleGenAI({ apiKey })

  const contents: any[] = [
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ]

  const callGemini = async (currentContents: any[]) => {
    try {
      const config: any = {
        systemInstruction: buildSystemInstruction(isAuthenticated)
      }
      
      if (isAuthenticated) {
        config.tools = tools
      }
      
      return await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: currentContents,
        config
      })
    } catch (err: any) {
      console.error('Gemini API error:', err?.message || err)
      throw createError({
        statusCode: 502,
        statusMessage: `Gemini error: ${err?.message || 'Unknown error contacting Gemini.'}`
      })
    }
  }

  let response = await callGemini(contents)
  let functionCallLoops = 0

  while (isAuthenticated && functionCallLoops < 4) {
    const functionCalls = response.functionCalls
    const call = functionCalls?.[0]
    if (!call || !call.name) break

    const { name, args } = call
    console.log('[ai-chat] Gemini requested tool', { name, args, todayPh: todayPhDateStr() })
    let toolResult: any = null

    if (!userId) {
      toolResult = { error: 'User ID not available' }
    } else if (name === 'get_sales_summary') {
      const startDate = (args?.start_date as string) || todayPhDateStr()
      const endDate = (args?.end_date as string) || todayPhDateStr()
      toolResult = await getSalesSummary(client, userId, startDate, endDate)
    } else if (name === 'get_today_sales') {
      toolResult = await getTodaySales(client, userId)
    } else if (name === 'get_top_debtors') {
      toolResult = await getTopDebtors(client, userId, Number(args?.limit) || 5)
    } else if (name === 'get_debtor_details') {
      toolResult = await getDebtorDetails(
        client,
        userId,
        (args?.debtor_name as string) || null,
        Boolean(args?.include_fully_paid)
      )
    } else if (name === 'get_riders_summary') {
      toolResult = await getRidersSummary(
        client,
        userId,
        (args?.start_date as string) || null,
        (args?.end_date as string) || null
      )
    } else if (name === 'get_workers_summary') {
      toolResult = await getWorkersSummary(client, userId, (args?.worker_name as string) || null)
    } else if (name === 'get_payroll_summary') {
      toolResult = await getPayrollSummary(client, userId, (args?.worker_name as string) || null)
    } else if (name === 'get_unpaid_balances') {
      toolResult = await getUnpaidBalances(client, userId)
    } else if (name === 'get_subscription_status') {
      toolResult = await getSubscriptionStatus(client, userId)
    } else if (name === 'get_business_report') {
      const startDate = (args?.start_date as string) || todayPhDateStr()
      const endDate = (args?.end_date as string) || todayPhDateStr()
      toolResult = await getBusinessReport(client, userId, startDate, endDate)
    } else {
      toolResult = { error: 'Unknown tool requested.' }
    }

    const modelParts = response.candidates?.[0]?.content?.parts
    
    contents.push({
      role: 'model',
      parts: modelParts && modelParts.length > 0 ? modelParts : [{ functionCall: call }]
    })
    
    contents.push({
      role: 'function',
      parts: [{
        functionResponse: {
          name: name,
          response: { result: toolResult }
        }
      }]
    })

    response = await callGemini(contents)
    functionCallLoops++
  }

  let finalText = response.text || 'Sorry, I could not get an answer just now. Please try again.'
  finalText = cleanResponse(finalText)

  if (isAuthenticated && userId && sessionId) {
    try {
      await saveMessage(client, sessionId, 'user', userMessage)
      await saveMessage(client, sessionId, 'assistant', finalText)
    } catch (error) {
      console.error('Error saving chat messages:', error)
    }
  }

  return { reply: finalText }
})