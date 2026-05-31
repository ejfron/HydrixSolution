import { useSupabaseClient, useSupabaseUser } from '#imports'

export const useProfile = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const profile = useState<{
    full_name: string
    station_name: string
    role: string
    email: string
  } | null>('user-profile', () => null)

  const fetchProfile = async () => {
    // If no user yet, wait for session explicitly
    if (!user.value?.id) {
      const { data: { session } } = await client.auth.getSession()
      if (!session?.user?.id) return

      const { data, error } = await client
        .from('profiles')
        .select('full_name, station_name, role, email')
        .eq('id', session.user.id)
        .single<{
          full_name: string
          station_name: string
          role: string
          email: string
        }>()
      if (data) profile.value = data
      return
    }

    // User is already available
    const { data, error } = await client
      .from('profiles')
      .select('full_name, station_name, role, email')
      .eq('id', user.value.id)
      .single<{
        full_name: string
        station_name: string
        role: string
        email: string
      }>()


    if (data) profile.value = data
  }

  return { profile, fetchProfile }
}