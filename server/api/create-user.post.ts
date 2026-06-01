declare const process: { env: Record<string, string | undefined> }

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, fullName, stationName, location, subscriptionStart, nextPaymentDate } = body

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.SUPABASE_URL

  if (!serviceKey || !supabaseUrl) {
    throw createError({ statusCode: 500, message: 'Missing server config' })
  }

  // Create user using admin API — does NOT sign in
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
      user_metadata: {
        full_name: fullName,
        station_name: stationName,
      }
    })
  })

  const newUser = await createRes.json()

  if (!createRes.ok) {
    throw createError({ statusCode: 400, message: newUser.message || 'Failed to create user' })
  }

  // Update profile with location and subscription
  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${newUser.id}`,
    {
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
      })
    }
  )

  if (!profileRes.ok) {
    throw createError({ statusCode: 400, message: 'User created but profile update failed' })
  }

  return { success: true, userId: newUser.id }
})