import { useSupabaseClient } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const client = useSupabaseClient()

  
  const { data: { user }, error: userError } = await client.auth.getUser()

  if (userError || !user) {
    return navigateTo('/loginpage')
  }

  const { data: profile } = await client
    .from('profiles')
    .select('role, plan')
    .eq('id', user.id)
    .single<{ role: string}>()

  if (!profile) {
    return navigateTo('/loginpage')
  }

  if (profile.role !== 'admin') {
    // Redirect to correct plan folder
  const { data: subscription } = await client
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle<{ plan: string }>()

    const plan = subscription?.plan || 'basic'

    const dest =
      plan === 'premium'  ? '/userPremium'  :
      plan === 'standard' ? '/userStandard' :
                              '/userBasic'

  return navigateTo(dest)
  }
})