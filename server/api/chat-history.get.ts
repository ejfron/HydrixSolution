// server/api/chat-history.get.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

interface ChatSession {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  is_active: boolean
  expires_at: string
}

interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated.' })
  }

  const userId = user.id
  const client = await serverSupabaseClient(event)

  // Get active session
  const { data: session, error: sessionError } = await client
    .from('chat_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<ChatSession>()

  if (sessionError || !session || !session.id) {
    return { messages: [] }
  }

  // Get messages
  const { data: messages, error: messagesError } = await client
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })
    .limit(20)
    .returns<ChatMessage[]>()

  if (messagesError) {
    return { messages: [] }
  }

  return { messages: messages || [] }
})