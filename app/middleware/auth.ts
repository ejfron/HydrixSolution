import { useSupabaseClient } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const client = useSupabaseClient()

  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    return navigateTo('/loginpage')
  }


  const { data: profile } = await client
    .from('profiles')
    .select('role, plan')
    .eq('id', user.id)
    .single<{ role: string; }>()

  if (!profile) {
    return navigateTo('/loginpage')
  }

 if (profile.role === 'admin' && to.path.startsWith('/user')) {
    return navigateTo('/admin')
  }

    if (profile.role !== 'admin' && to.path.startsWith('/admin')) {
    return navigateTo('/loginpage')
  }



  const { data: subscription } = await client
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle<{ plan: string }>()

    const plan = subscription?.plan || 'basic'

    const correctBase =
      plan === 'premium'  ? '/userPremium'  :
      plan === 'standard' ? '/userStandard' :
                              '/userBasic'

    const wrongBases = ['/userBasic', '/userStandard', '/userPremium']
    .filter(b => b !== correctBase)

  if (wrongBases.some(b => to.path.startsWith(b))) {
    return navigateTo(correctBase)
  }
 
})