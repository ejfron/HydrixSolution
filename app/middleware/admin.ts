import { useSupabaseClient } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const client = useSupabaseClient()

  // Always use getUser() — secure and works in production
  const { data: { user }, error: userError } = await client.auth.getUser()

  if (userError || !user) {
    return navigateTo('/loginpage')
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (profileError || !profile) {
    return navigateTo('/loginpage')
  }

  if (profile.role !== 'admin') {
    return navigateTo('/user')
  }
})