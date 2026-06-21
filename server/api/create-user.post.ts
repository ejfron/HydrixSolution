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

  // ── New Plan config ──────────────────────────────────────
  const PLANS: Record<string, { setupFee: number; monthlyFee: number; isPremium: boolean }> = {
    basic:    { setupFee: 2500,  monthlyFee: 300, isPremium: false },
    standard: { setupFee: 5000,  monthlyFee: 500, isPremium: false },
    premium:  { setupFee: 80000, monthlyFee: 0,   isPremium: true  },
  }

  const planConfig = PLANS[plan]
  if (!planConfig) {
    throw createError({ statusCode: 400, message: `Invalid plan: ${plan}` })
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
    throw createError({ statusCode: 500, message: 'User created but ID not returned' })
  }

  // ── Wait for DB trigger ──────────────────────────────────
  await new Promise(resolve => setTimeout(resolve, 1500))

  // ── Update profile ────────────────────────────────────────
  // Premium = no expiry, set next_payment_date to null and status always active
  const profilePatch: Record<string, any> = {
    location,
    subscription_start: subscriptionStart,
    subscription_status: 'active',
    plan,
    setup_fee_paid: true,
  }

  if (!planConfig.isPremium) {
    profilePatch.next_payment_date = nextPaymentDate
  } else {
    profilePatch.next_payment_date = null // premium never expires
  }

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
      body: JSON.stringify(profilePatch)
    }
  )

  if (!profileRes.ok) {
    const profileErr = await profileRes.text()
    throw createError({ statusCode: 500, message: `Profile update failed: ${profileErr}` })
  }

  // ── Create subscription record ──────────────────────────
  // For new model: total_price = setupFee, downpayment = setupFee (paid upfront),
  // remaining_balance = 0 (setup), monthly_due = monthlyFee, payment_months = 0 (ongoing)
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
      total_price: planConfig.setupFee,
      downpayment: planConfig.setupFee,   // setup fee paid upfront
      remaining_balance: 0,               // no installment balance
      monthly_due: planConfig.monthlyFee, // 500 for basic/standard, 0 for premium
      payment_months: 0,                  // ongoing — no fixed end
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

  // ── Create first monthly payment entry (if not premium) ──
  // Only create the FIRST upcoming payment — admin marks paid each month
  if (!planConfig.isPremium) {
    const firstDueDate = new Date(subscriptionStart + 'T00:00:00')
    firstDueDate.setMonth(firstDueDate.getMonth() + 1)

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
        body: JSON.stringify([{
          subscription_id: subscriptionId,
          user_id: userId,
          due_date: firstDueDate.toISOString().split('T')[0],
          amount_due: planConfig.monthlyFee,
          amount_paid: 0,
          status: 'unpaid'
        }])
      }
    )

    if (!scheduleRes.ok) {
      const schedErr = await scheduleRes.text()
      throw createError({
        statusCode: 500,
        message: `Payment schedule failed: ${schedErr}`
      })
    }
  }

  return { success: true, userId }
})