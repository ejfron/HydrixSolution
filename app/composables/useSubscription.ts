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
      .select('subscription_status, next_payment_date')
      .eq('id', userId)
      .single()

    if (!data) return

    nextPaymentDate.value = data.next_payment_date

    const today = new Date()
    const paymentDate = new Date(data.next_payment_date)
    const diff = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    daysRemaining.value = diff
    isExpired.value = diff <= 0 || data.subscription_status === 'expired'

    // Auto update status if expired
    if (diff <= 0 && data.subscription_status === 'active') {
      await (client.from('profiles') as any)
        .update({ subscription_status: 'expired' })
        .eq('id', userId)
      isExpired.value = true
    }
  }

  return { isExpired, nextPaymentDate, daysRemaining, checkSubscription }
}