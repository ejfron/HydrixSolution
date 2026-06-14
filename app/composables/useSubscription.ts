import { useSupabaseClient } from '#imports'

export const useSubscription = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const isExpired = ref(false)
  const nextPaymentDate = ref<string | null>(null)
  const daysRemaining = ref(0)

  const checkSubscription = async () => {
    const { data: { session } } = await client.auth.getSession()
    const userId = user.value?.id ?? session?.user?.id
    if (!userId) return

    const { data } = await (client.from('profiles') as any)
      .select('subscription_status, next_payment_date, plan')
      .eq('id', userId)
      .single()

    if (!data) return

    // Premium plan never expires
    if (data.plan === 'premium') {
      isExpired.value = false
      daysRemaining.value = 9999
      nextPaymentDate.value = null
      return
    }

    nextPaymentDate.value = data.next_payment_date

    if (!data.next_payment_date) {
      isExpired.value = false
      daysRemaining.value = 30
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const paymentDate = new Date(data.next_payment_date + 'T00:00:00')
    const diff = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    daysRemaining.value = diff
    isExpired.value = diff <= 0 || data.subscription_status === 'expired'

    // Auto-update status if expired
    if (diff <= 0 && data.subscription_status === 'active') {
      await (client.from('profiles') as any)
        .update({ subscription_status: 'expired' })
        .eq('id', userId)
      isExpired.value = true
    }
  }

  return { isExpired, nextPaymentDate, daysRemaining, checkSubscription }
}