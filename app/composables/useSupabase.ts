import { useSupabaseClient, useSupabaseUser } from '#imports'

export const useDB = () => useSupabaseClient()
export const useUser = () => useSupabaseUser()