import { createHmac } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const webhookSecret = config.paymongoWebhookSecret as string
  const supabaseUrl = config.supabaseUrl as string
  const serviceKey = config.supabaseServiceRoleKey as string

  const rawBody = await readRawBody(event)
  const signature = getHeader(event, 'paymongo-signature')

  if (webhookSecret && signature && rawBody) {
    const parts = signature.split(',')
    const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1]
    const sigHash = parts.find(p => p.startsWith('te='))?.split('=')[1]

    const toSign = `${timestamp}.${rawBody}`
    const expected = createHmac('sha256', webhookSecret)
      .update(toSign)
      .digest('hex')

    if (expected !== sigHash) {
      throw createError({ statusCode: 400, message: 'Invalid webhook signature' })
    }
  }

  const payload = JSON.parse(rawBody || '{}')
  const eventType = payload?.data?.attributes?.type
  const sourceData = payload?.data?.attributes?.data

  if (eventType !== 'source.chargeable') {
    return { received: true }
  }

  const userId = sourceData?.attributes?.metadata?.user_id
  if (!userId) return { received: true }

  const secretKey = config.paymongoSecretKey as string

  // Charge the source
  const chargeRes = await fetch('https://api.paymongo.com/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: 50000,
          currency: 'PHP',
          source: {
            id: sourceData.id,
            type: 'source'
          },
          description: 'Hydrix Monthly Subscription ₱500'
        }
      }
    })
  })

  const chargeData = await chargeRes.json()
  const chargeStatus = chargeData?.data?.attributes?.status

  if (chargeStatus !== 'paid') return { received: true }

  // Get current profile
  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    }
  )
  const profileData = await profileRes.json()
  const currentProfile = profileData?.[0]
  if (!currentProfile) return { received: true }

  // Extend next_payment_date by 1 month
  let baseDate = new Date()
  if (currentProfile.next_payment_date) {
    const existing = new Date(currentProfile.next_payment_date + 'T00:00:00')
    if (existing > baseDate) baseDate = existing
  }
  baseDate.setMonth(baseDate.getMonth() + 1)
  const newNextPaymentDate = baseDate.toLocaleDateString('en-CA')

  // Update profile
  await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      subscription_status: 'active',
      next_payment_date: newNextPaymentDate
    })
  })

  // Get subscription id
  const subRes = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&order=created_at.desc&limit=1`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    }
  )
  const subData = await subRes.json()
  const subscriptionId = subData?.[0]?.id

  // Record payment
  if (subscriptionId) {
    const today = new Date().toISOString().split('T')[0]
    await fetch(`${supabaseUrl}/rest/v1/subscription_payments`, {
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
        due_date: today,
        amount_due: 500,
        amount_paid: 500,
        status: 'paid',
        paid_at: new Date().toISOString()
      }])
    })
  }

  return { received: true }
})