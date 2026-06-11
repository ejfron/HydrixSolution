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

  const { data: profile } = await client
    .from('profiles')
    .select('role, plan')
    .eq('id', user.id)
    .single<{ role: string; plan: string | null }>()

  if (!profile) {
    return navigateTo('/loginpage')
  }

  // ── Admin: block from all user pages ──────────────────────
  if (profile.role === 'admin') {
    if (
      to.path.startsWith('/userBasic') ||
      to.path.startsWith('/userStandard') ||
      to.path.startsWith('/userPremium')
    ) {
      return navigateTo('/admin')
    }
    // Admin is allowed — no further checks needed
    return
  }

  // ── User: block from admin pages ───────────────────────────
  if (to.path.startsWith('/admin')) {
    const dest =
      profile.plan === 'premium'  ? '/userPremium'  :
      profile.plan === 'standard' ? '/userStandard' :
                                    '/userBasic'
    return navigateTo(dest)
  }

  // ── User: enforce correct plan folder ──────────────────────
  const correctBase =
    profile.plan === 'premium'  ? '/userPremium'  :
    profile.plan === 'standard' ? '/userStandard' :
                                  '/userBasic'

  const wrongBases = ['/userBasic', '/userStandard', '/userPremium']
    .filter(b => b !== correctBase)

  if (wrongBases.some(b => to.path.startsWith(b))) {
    return navigateTo(correctBase)
  }
})