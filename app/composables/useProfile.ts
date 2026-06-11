import { useSupabaseClient, useSupabaseUser } from '#imports'

export const useProfile = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  // ── Use ref instead of useState to avoid stale cache ──────
  const profile = ref<{
    full_name: string
    station_name: string
    role: string
    email: string
    plan: string
  } | null>(null)

  const fetchProfile = async () => {
    let userId: string | undefined

    // Try user first, fallback to session
    if (user.value?.id) {
      userId = user.value.id
    } else {
      const { data: { session } } = await client.auth.getSession()
      userId = session?.user?.id
    }

    if (!userId) return

    const { data } = await client
      .from('profiles')
      .select('full_name, station_name, role, email, plan')
      .eq('id', userId)
      .single<{
        full_name: string
        station_name: string
        role: string
        email: string
        plan: string
      }>()

    if (data) profile.value = data
  }

  return { profile, fetchProfile }
}