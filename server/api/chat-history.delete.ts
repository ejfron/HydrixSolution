// server/api/chat-history.delete.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated.' })
  }

  const userId = user.id
  const client = await serverSupabaseClient(event)

  // Deactivate all active sessions for this user
  const { error } = await client
    .from('chat_sessions')
    .update({ is_active: false } as never)
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Error clearing chat history.' })
  }

  return { success: true }
})