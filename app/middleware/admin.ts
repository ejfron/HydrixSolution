import { useSupabaseClient } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const client = useSupabaseClient()

  let user = null
  let attempts = 0

  while (!user && attempts < 3) {
    const { data } = await client.auth.getUser()
    user = data.user
    if (!user) await new Promise(resolve => setTimeout(resolve, 300))
    attempts++
  }

  if (!user) {
    return navigateTo('/loginpage')
  }

  const { data: profile, error } = await client
    .from('profiles')
    .select('role, plan')
    .eq('id', user.id)
    .single<{ role: string; plan: string | null }>()

  if (error || !profile) {
    return navigateTo('/loginpage')
  }

  // Only admins allowed past this point
  if (profile.role !== 'admin') {
    const dest =
      profile.plan === 'premium'  ? '/userPremium'  :
      profile.plan === 'standard' ? '/userStandard' :
                                    '/userBasic'
    return navigateTo(dest)
  }
})