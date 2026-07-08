// server/api/create-user.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    email,
    password,
    fullName,
    stationName,
    location,
    subscriptionStart,
    plan,
    downpayment,
    paymentMonths,
  } = body

  const config = useRuntimeConfig()
  const serviceKey = config.supabaseServiceRoleKey as string
  const supabaseUrl = config.supabaseUrl as string

  if (!serviceKey || !supabaseUrl) {
    throw createError({
      statusCode: 500,
      message: `Missing server config — serviceKey: ${!!serviceKey}, url: ${!!supabaseUrl}`
    })
  }

  // All plans now support installments – no "isPremium" flag
  const PLANS: Record<string, {
    totalPrice: number
    minDownpayment: number
    minMonths: number
    maxMonths: number
  }> = {
    basic: {
      totalPrice: 10000,
      minDownpayment: 599,
      minMonths: 3,
      maxMonths: 7,
    },
    standard: {
      totalPrice: 15000,
      minDownpayment: 2499,
      minMonths: 3,
      maxMonths: 17,
    },
    premium: {
      totalPrice: 50000,
      minDownpayment: 15000,
      minMonths: 3,
      maxMonths: 12,
    },
  }

  const planConfig = PLANS[plan]
  if (!planConfig) {
    throw createError({ statusCode: 400, message: `Invalid plan: ${plan}` })
  }

  // Validate downpayment
  if (!downpayment || downpayment < planConfig.minDownpayment) {
    throw createError({
      statusCode: 400,
      message: `Downpayment must be at least ₱${planConfig.minDownpayment.toLocaleString()} for ${plan} plan.`
    })
  }
  if (downpayment > planConfig.totalPrice) {
    throw createError({
      statusCode: 400,
      message: `Downpayment cannot exceed total price (₱${planConfig.totalPrice.toLocaleString()}).`
    })
  }

  // Validate months (same for all plans)
  const months = paymentMonths || 0
  if (months < planConfig.minMonths || months > planConfig.maxMonths) {
    throw createError({
      statusCode: 400,
      message: `Payment months must be between ${planConfig.minMonths} and ${planConfig.maxMonths} for ${plan} plan.`
    })
  }

  const totalPrice = planConfig.totalPrice
  const remainingBalance = totalPrice - downpayment
  const monthlyDue = months > 0 ? Math.round((remainingBalance / months) * 100) / 100 : 0

  // Create Supabase Auth user
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

  const userId = newUserData?.user?.id || newUserData?.id
  if (!userId) {
    throw createError({ statusCode: 500, message: 'User created but ID not returned' })
  }

  await new Promise(resolve => setTimeout(resolve, 1500))

  // Update profile
  const firstDueDate = months > 0
    ? new Date(subscriptionStart + 'T00:00:00')
    : null
  if (firstDueDate) firstDueDate.setMonth(firstDueDate.getMonth() + 1)

  const profilePatch: Record<string, any> = {
    location,
    subscription_start: subscriptionStart,
    subscription_status: 'active',
    plan,
    setup_fee_paid: true,
    next_payment_date: firstDueDate ? firstDueDate.toISOString().split('T')[0] : null,
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

  // Create subscription record
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
      total_price: totalPrice,
      downpayment: downpayment,
      remaining_balance: remainingBalance,
      monthly_due: monthlyDue,
      payment_months: months,
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

  // Generate payment schedule (if months > 0)
  if (months > 0) {
    const dueEntries = []
    const start = new Date(subscriptionStart + 'T00:00:00')

    for (let i = 1; i <= months; i++) {
      const dueDate = new Date(start)
      dueDate.setMonth(dueDate.getMonth() + i)
      const amount = i === months
        ? Math.round((remainingBalance - monthlyDue * (months - 1)) * 100) / 100
        : monthlyDue

      dueEntries.push({
        subscription_id: subscriptionId,
        user_id: userId,
        due_date: dueDate.toISOString().split('T')[0],
        amount_due: amount,
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
        body: JSON.stringify(dueEntries)
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