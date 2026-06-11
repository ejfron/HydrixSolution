export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    email,
    password,
    fullName,
    stationName,
    location,
    subscriptionStart,
    nextPaymentDate,
    plan,
    downpayment,
    paymentMonths
  } = body

  // ── Runtime config ───────────────────────────────────────
  const config = useRuntimeConfig()
  const serviceKey = config.supabaseServiceRoleKey as string
  const supabaseUrl = config.supabaseUrl as string

  if (!serviceKey || !supabaseUrl) {
    throw createError({
      statusCode: 500,
      message: `Missing server config — serviceKey: ${!!serviceKey}, url: ${!!supabaseUrl}`
    })
  }

  // ── Plan config ──────────────────────────────────────────
  const PLANS: Record<string, { total: number; minDown: number; maxMonths: number }> = {
    basic:    { total: 10000, minDown: 2000,  maxMonths: 12 },
    standard: { total: 15000, minDown: 4000,  maxMonths: 12 },
    premium:  { total: 80000, minDown: 30000, maxMonths: 24 }
  }

  const planConfig = PLANS[plan]
  if (!planConfig) {
    throw createError({ statusCode: 400, message: `Invalid plan: ${plan}` })
  }

  if (Number(downpayment) < planConfig.minDown) {
    throw createError({
      statusCode: 400,
      message: `Minimum downpayment for ${plan} is ₱${planConfig.minDown.toLocaleString()}`
    })
  }

  // ── Create Supabase Auth user ────────────────────────────
  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        station_name: stationName
      }
    })
  })

  const newUserData = await createRes.json()

  if (!createRes.ok) {
    throw createError({
      statusCode: 400,
      message: newUserData?.message || newUserData?.error_description || 'Failed to create user'
    })
  }

  // ── Extract user ID ──────────────────────────────────────
  const userId = newUserData?.user?.id || newUserData?.id

  if (!userId) {
    throw createError({
      statusCode: 500,
      message: 'User created but ID not returned'
    })
  }

  // ── Wait for DB trigger ──────────────────────────────────
  await new Promise(resolve => setTimeout(resolve, 1500))

  // ── Update profile ────────────────────────────────────────
  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        location,
        subscription_start: subscriptionStart,
        next_payment_date: nextPaymentDate,
        subscription_status: 'active',
        plan
      })
    }
  )

  if (!profileRes.ok) {
    const profileErr = await profileRes.text()
    throw createError({
      statusCode: 500,
      message: `Profile update failed: ${profileErr}`
    })
  }

  // ── Create subscription ──────────────────────────────────
  const remaining = planConfig.total - Number(downpayment)
  const monthlyDue = Math.ceil(remaining / Number(paymentMonths))

  const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      user_id: userId,
      plan,
      total_price: planConfig.total,
      downpayment: Number(downpayment),
      remaining_balance: remaining,
      monthly_due: monthlyDue,
      payment_months: Number(paymentMonths),
      start_date: subscriptionStart,
      status: 'active'
    })
  })

  const subData = await subRes.json()
  const subscriptionId = subData?.[0]?.id

  if (!subscriptionId) {
    throw createError({
      statusCode: 500,
      message: `Subscription failed: ${JSON.stringify(subData)}`
    })
  }

  // ── Payment schedule ──────────────────────────────────────
  const paymentSchedule = []
  const startDate = new Date(subscriptionStart + 'T00:00:00')

  for (let i = 1; i <= Number(paymentMonths); i++) {
    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + i)
    paymentSchedule.push({
      subscription_id: subscriptionId,
      user_id: userId,
      due_date: dueDate.toISOString().split('T')[0],
      amount_due: monthlyDue,
      amount_paid: 0,
      status: 'unpaid'
    })
  }

  const scheduleRes = await fetch(
    `${supabaseUrl}/rest/v1/subscription_payments`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(paymentSchedule)
    }
  )

  if (!scheduleRes.ok) {
    const schedErr = await scheduleRes.text()
    throw createError({
      statusCode: 500,
      message: `Payment schedule failed: ${schedErr}`
    })
  }

  return { success: true, userId }
})