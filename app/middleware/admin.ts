import { useSupabaseClient } from '#imports'

export default defineNuxtRouteMiddleware(async () => {
  const client = useSupabaseClient()

  // Use getUser() which is secure and works on both server and client
  const { data: { user }, error: userError } = await client.auth.getUser()

  console.log('middleware user:', user)
  console.log('middleware userError:', userError)

  if (!user) {
    return navigateTo('/loginpage')
  }

  const { data: profile, error } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  console.log('middleware profile:', profile)
  console.log('middleware error:', error)

  if (profile?.role !== 'admin') {
    return navigateTo('/user')
  }
})