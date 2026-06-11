export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    email, password, fullName, stationName, location,
    subscriptionStart, nextPaymentDate,
    plan, downpayment, paymentMonths
  } = body

  // ── Use runtimeConfig instead of process.env ──────────────
  const config = useRuntimeConfig()
  const serviceKey = config.supabaseServiceRoleKey
  const supabaseUrl = config.supabaseUrl

  if (!serviceKey || !supabaseUrl) {
    throw createError({ statusCode: 500, message: 'Missing server config' })
  }

  const PLANS: Record<string, { total: number; minDown: number; maxMonths: number }> = {
    basic:    { total: 10000,  minDown: 2000,  maxMonths: 12 },
    standard: { total: 15000,  minDown: 4000,  maxMonths: 12 },
    premium:  { total: 80000,  minDown: 30000, maxMonths: 24 },
  }

  const planConfig = PLANS[plan]
  if (!planConfig) {
    throw createError({ statusCode: 400, message: 'Invalid plan' })
  }

  if (downpayment < planConfig.minDown) {
    throw createError({
      statusCode: 400,
      message: `Minimum downpayment for ${plan} is ₱${planConfig.minDown.toLocaleString()}`
    })
  }

  // ── Create auth user ───────────────────────────────────────
  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, station_name: stationName }
    })
  })

  const newUser = await createRes.json()
  if (!createRes.ok) {
    throw createError({
      statusCode: 400,
      message: newUser.message || newUser.error_description || 'Failed to create user'
    })
  }

  // ── Wait briefly for trigger to create profile ─────────────
  await new Promise(resolve => setTimeout(resolve, 1000))

  // ── Update profile ─────────────────────────────────────────
  const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${newUser.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      location,
      subscription_start: subscriptionStart,
      next_payment_date: nextPaymentDate,
      subscription_status: 'active',
      plan,
    })
  })

  if (!profileRes.ok) {
    const profileErr = await profileRes.text()
    throw createError({ statusCode: 500, message: `Profile update failed: ${profileErr}` })
  }

  // ── Create subscription ────────────────────────────────────
  const remaining = planConfig.total - downpayment
  const monthlyDue = Math.ceil(remaining / paymentMonths)

  const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      user_id: newUser.id,
      plan,
      total_price: planConfig.total,
      downpayment,
      remaining_balance: remaining,
      monthly_due: monthlyDue,
      payment_months: paymentMonths,
      start_date: subscriptionStart,
      status: 'active',
    })
  })

  const subData = await subRes.json()
  const subscriptionId = subData[0]?.id

  if (!subscriptionId) {
    const subErr = JSON.stringify(subData)
    throw createError({ statusCode: 500, message: `Failed to create subscription: ${subErr}` })
  }

  // ── Generate monthly payment schedule ──────────────────────
  const paymentSchedule = []
  const startDate = new Date(subscriptionStart + 'T00:00:00')

  for (let i = 1; i <= paymentMonths; i++) {
    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + i)

    paymentSchedule.push({
      subscription_id: subscriptionId,
      user_id: newUser.id,
      due_date: dueDate.toISOString().split('T')[0],
      amount_due: monthlyDue,
      amount_paid: 0,
      status: 'unpaid',
    })
  }

  const scheduleRes = await fetch(`${supabaseUrl}/rest/v1/subscription_payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(paymentSchedule)
  })

  if (!scheduleRes.ok) {
    const schedErr = await scheduleRes.text()
    throw createError({ statusCode: 500, message: `Payment schedule failed: ${schedErr}` })
  }

  return { success: true, userId: newUser.id }
})


