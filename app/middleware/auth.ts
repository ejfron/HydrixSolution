import { useSupabaseClient } from '#imports'

export default defineNuxtRouteMiddleware(async () => {
  const client = useSupabaseClient()

  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    return navigateTo('/loginpage')
  }
})