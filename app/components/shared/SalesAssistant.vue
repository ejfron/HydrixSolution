<script setup lang="ts">
import { ref, nextTick, onMounted, computed, watch } from 'vue'
import { Send, Sparkles, Loader, Bot, User, MessageCircle, X, Trash2 } from '@lucide/vue'
import { useSupabaseUser } from '#imports'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const user = useSupabaseUser()
const isAuthenticated = computed(() => !!user.value)

const isOpen = ref(false)
const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const sending = ref(false)
const scrollEl = ref<HTMLElement | null>(null)
const isLoadingHistory = ref(false)

const loadChatHistory = async () => {
  if (!isAuthenticated.value) {
    messages.value = [{
      role: 'assistant',
      content: 'Welcome to Hydrix Water Station System! I can help you learn about our services, pricing, and how to get started. What would you like to know?'
    }] 
    return
  }

  isLoadingHistory.value = true
  try {
    const response = await $fetch<{ messages: ChatMessage[] }>('/api/chat-history', {
      method: 'GET'
    })
    
    if (response && response.messages && response.messages.length > 0) {
      messages.value = response.messages
    } else {
      messages.value = [{
        role: 'assistant',
        content: 'Hi! Ask me about your sales, collections, or debts — e.g. "how much are my sales today?" or "who owes me the most?"'
      }]
    }
  } catch (error) {
    console.error('Error loading chat history:', error)
    messages.value = [{
      role: 'assistant',
      content: 'Hi! Ask me about your sales, collections, or debts — e.g. "how much are my sales today?" or "who owes me the most?"'
    }]
  } finally {
    isLoadingHistory.value = false
    await scrollToBottom()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (scrollEl.value) {
    scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  }
}

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || sending.value) return

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  sending.value = true
  await scrollToBottom()

  try {
    const historyForServer = messages.value.slice(0, -1).slice(-10)
    
    const res = await $fetch<{ reply: string }>('/api/ai-chat', {
      method: 'POST',
      body: {
        message: text,
        history: historyForServer,
        isAuthenticated: isAuthenticated.value
      }
    })
    messages.value.push({ role: 'assistant', content: res.reply })
    await scrollToBottom()
  } catch (err: any) {
    console.error('Chat API error:', err)
    messages.value.push({
      role: 'assistant',
      content: err.message || 'Sorry, something went wrong. Please try again.'
    })
    await scrollToBottom()
  } finally {
    sending.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const quickActions = [
  { label: 'Pricing', message: 'How much does the system cost?' },
  { label: 'Features', message: 'What features does the system have?' },
  { label: 'Get Started', message: 'How can I avail the system?' },
  { label: 'Contact', message: 'How can I contact support?' }
]

const sendQuickAction = (message: string) => {
  inputText.value = message
  sendMessage()
}

const clearChat = async () => {
  if (!confirm('Clear chat history?')) return
  
  try {
    await $fetch('/api/chat-history', {
      method: 'DELETE' as const
    })
    messages.value = [{
      role: 'assistant',
      content: 'Hi! Ask me about your sales, collections, or debts — e.g. "how much are my sales today?" or "who owes me the most?"'
    }]
    await scrollToBottom()
  } catch (error) {
    console.error('Error clearing chat:', error)
  }
}

watch(isAuthenticated, (newVal) => {
  if (newVal) {
    loadChatHistory()
  } else {
    messages.value = [{
      role: 'assistant',
      content: 'Welcome to Hydrix Water Station System! I can help you learn about our services, pricing, and how to get started. What would you like to know?'
    }]
  }
})

onMounted(async () => {
  await loadChatHistory()
})
</script>

<template>
  <div class="sales-assistant-wrapper  fixed right-5 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="isOpen"
        class="pointer-events-auto w-[92vw] max-w-sm h-[70vh] max-h-[600px] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div class="px-5 py-4 bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-between gap-2 shrink-0">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles :size="16" class="text-white" />
            </div>
            <div>
              <p class="text-white font-bold text-sm">Sales Assistant</p>
              <p class="text-green-100 text-xs">
                {{ isAuthenticated ? 'Ask about sales, debts, and more' : 'Learn about Hydrix System' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-if="isAuthenticated"
              @click="clearChat"
              class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition shrink-0"
              title="Clear chat history"
            >
              <Trash2 :size="14" class="text-white" />
            </button>
            <button
              @click="isOpen = false"
              class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition shrink-0"
            >
              <X :size="16" class="text-white" />
            </button>
          </div>
        </div>

        <div v-if="!isAuthenticated && messages.length === 1" class="px-4 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
          <p class="text-xs text-slate-500 mb-2">Quick questions:</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="action in quickActions"
              :key="action.label"
              @click="sendQuickAction(action.message)"
              class="px-3 py-1.5 bg-white border border-slate-200 hover:border-green-300 hover:bg-green-50 rounded-full text-xs font-medium text-slate-600 transition cursor-pointer"
            >
              {{ action.label }}
            </button>
          </div>
        </div>

        <div v-if="isLoadingHistory" class="flex-1 flex items-center justify-center bg-slate-50">
          <Loader :size="24" class="text-green-500 animate-spin" />
          <span class="ml-2 text-sm text-slate-400">Loading chat history...</span>
        </div>

        <div v-else ref="scrollEl" class="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
          <div
            v-for="(m, idx) in messages"
            :key="idx"
            :class="['flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start']"
          >
            <div
              v-if="m.role === 'assistant'"
              class="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5"
            >
              <Bot :size="14" class="text-green-600" />
            </div>
            <div
              :class="[
                'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                m.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-md'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'
              ]"
            >
              {{ m.content }}
            </div>
            <div
              v-if="m.role === 'user'"
              class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5"
            >
              <User :size="14" class="text-slate-500" />
            </div>
          </div>

          <div v-if="sending" class="flex gap-2 justify-start">
            <div class="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
              <Bot :size="14" class="text-green-600" />
            </div>
            <div class="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1.5">
              <Loader :size="14" class="text-slate-400 animate-spin" />
              <span class="text-xs text-slate-400">
                {{ isAuthenticated ? 'Checking your numbers...' : 'Thinking...' }}
              </span>
            </div>
          </div>

          <div v-if="isAuthenticated" class="text-center text-[10px] text-slate-300 pt-2">
            Chat history saved for 24 hours
          </div>
        </div>

        <div class="p-3 border-t border-slate-100 flex items-end gap-2 shrink-0">
          <textarea
            v-model="inputText"
            @keydown="handleKeydown"
            rows="1"
            :placeholder="isAuthenticated ? 'Ask about sales, debts, gallons sold...' : 'Ask about Hydrix system...'"
            class="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition max-h-24"
          ></textarea>
          <button
            @click="sendMessage"
            :disabled="!inputText.trim() || sending"
            class="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <Send :size="16" />
          </button>
        </div>
      </div>
    </Transition>

    <button
      @click="isOpen = !isOpen"
      class="pointer-events-auto w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-xl flex items-center justify-center text-white transition cursor-pointer shrink-0"
      aria-label="Open sales assistant"
    >
      <X v-if="isOpen" :size="22" />
      <MessageCircle v-else :size="22" />
    </button>
  </div>
</template>

<style scoped>
.sales-assistant-wrapper {
  z-index: 9999 !important;
}

.sales-assistant-wrapper * {
  box-sizing: border-box;
}

button {
  transition: all 0.2s ease;
}

.overflow-y-auto {
  scroll-behavior: smooth;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>