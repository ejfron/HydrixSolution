// composables/useSubscription.ts
import { useSupabaseClient, useSupabaseUser } from '#imports'

export const useSubscription = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const isExpired = ref(false)
  const nextPaymentDate = ref<string | null>(null)
  const daysRemaining = ref(0)
  const plan = ref<string | null>(null)
  const isLoading = ref(true)

  // Full subscription details
  const subscription = ref<{
    total_price: number
    downpayment: number
    remaining_balance: number
    monthly_due: number
    payment_months: number
    start_date: string
    status: string
  } | null>(null)

  // Payment schedule (unpaid/overdue)
  const paymentSchedule = ref<Array<{
    id: string
    due_date: string
    amount_due: number
    amount_paid: number
    status: 'paid' | 'unpaid' | 'overdue'
  }>>([])

  const checkSubscription = async () => {
    const { data: { session } } = await client.auth.getSession()
    const userId = user.value?.id ?? session?.user?.id
    if (!userId) {
      isLoading.value = false
      return
    }

    // 1. Get profile for plan
    const { data: profile } = await (client.from('profiles') as any)
      .select('plan, subscription_status, next_payment_date')
      .eq('id', userId)
      .single()

    if (!profile) {
      isLoading.value = false
      return
    }

    plan.value = profile.plan

    // 2. Get subscription record
    const { data: sub } = await (client.from('subscriptions') as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sub) {
      subscription.value = sub
    }

    // 3. If there is a payment schedule (payment_months > 0), fetch it
    if (sub && (sub.payment_months ?? 0) > 0) {
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
          return { ...p, status }
        })

        // Find next unpaid/overdue
        const next = paymentSchedule.value.find(p => p.status === 'unpaid' || p.status === 'overdue')
        if (next) {
          nextPaymentDate.value = next.due_date
          const due = new Date(next.due_date + 'T00:00:00')
          const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          daysRemaining.value = diff
          isExpired.value = next.status === 'overdue' || diff <= 0
        } else {
          // All paid
          isExpired.value = false
          daysRemaining.value = 999
          nextPaymentDate.value = null
        }
      }
    } else if (sub && (sub.payment_months ?? 0) === 0) {
      // No installments – treated as fully paid (Premium legacy or full payment)
      isExpired.value = false
      daysRemaining.value = 9999
      nextPaymentDate.value = null
    } else {
      // Fallback to profile.next_payment_date (backward compatibility)
      nextPaymentDate.value = profile.next_payment_date
      if (!profile.next_payment_date) {
        isExpired.value = false
        daysRemaining.value = 30
      } else {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const due = new Date(profile.next_payment_date + 'T00:00:00')
        const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        daysRemaining.value = diff
        isExpired.value = diff <= 0 || profile.subscription_status === 'expired'
      }
    }

    isLoading.value = false
  }

  return {
    isExpired,
    nextPaymentDate,
    daysRemaining,
    plan,
    isLoading,
    subscription,
    paymentSchedule,
    checkSubscription
  }
}