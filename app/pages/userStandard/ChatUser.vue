<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <div class="p-4 sm:p-8 space-y-6">
        <!-- Standard Plan Badge -->
        <div class="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              <span class="text-white text-sm font-bold">S</span>
            </div>
            <div>
              <p class="text-sm font-semibold text-green-800">Standard Plan</p>
              <p class="text-xs text-green-600">Create up to 2 users for chatting</p>
            </div>
          </div>
          <button 
            @click="router.push('/userStandard/Subscription')"
            class="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition"
          >
            Upgrade to Premium
          </button>
        </div>

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Chat System</h2>
            <p class="text-slate-500 text-xs sm:text-sm mt-1">Single Chat Box - Create up to 2 users</p>
          </div>
        </div>

        <!-- Create Users Section (shown only when less than 2 users) -->
        <div v-if="users.length < 2" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div class="flex items-center gap-2 mb-3">
            <UserPlus :size="20" class="text-green-600" />
            <h3 class="font-semibold text-gray-800">Create Users ({{ users.length }}/2)</h3>
          </div>
          <p class="text-sm text-slate-600 mb-4">Create up to 2 users who can chat with each other</p>
          <div class="flex gap-3">
            <input
              v-model="newUserName"
              @keyup.enter="createUser"
              type="text"
              placeholder="Enter user name (e.g., Boss, Cherry)"
              class="flex-1 text-gray-600 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              @click="createUser"
              :disabled="!newUserName.trim() || users.length >= 2"
              class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition"
            >
              Create User
            </button>
          </div>
        </div>

        <!-- User Selection Tabs -->
        <div v-if="users.length > 0" class="bg-white rounded-2xl border border-slate-100 p-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex gap-2 overflow-x-auto pb-1">
              <button
                v-for="user in users"
                :key="user.id"
                @click="currentUser = user.id"
                :class="[
                  'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap',
                  currentUser === user.id 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                <User :size="14" />
                Chat as: {{ user.name }}
              </button>
            </div>
            <div class="text-xs text-slate-400">
              Currently chatting as: <span class="font-semibold text-green-600">{{ getCurrentUserName() }}</span>
            </div>
          </div>
        </div>

        <!-- Main Chat Box -->
        <div v-if="users.length === 2" class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div class="flex flex-col h-[calc(100vh-350px)] min-h-[400px]">
            <!-- Chat Header -->
            <div class="p-4 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                    <MessageCircle :size="20" class="text-white" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-800">All Chat</h3>
                    <p class="text-xs text-slate-500">{{ getUserName(users[0]?.id || '') }} & {{ getUserName(users[1]?.id || '') }} • {{ messages.length }} messages</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
              <div v-if="messages.length === 0" class="text-center py-20">
                <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle :size="24" class="text-slate-400" />
                </div>
                <p class="text-slate-400 text-sm">No messages yet</p>
                <p class="text-slate-300 text-xs mt-1">Start the conversation!</p>
              </div>
              
              <div v-for="msg in messages" :key="msg.id" class="flex" :class="msg.senderId === currentUser ? 'justify-end' : 'justify-start'">
                <div class="flex items-end gap-2 max-w-[75%]" :class="msg.senderId === currentUser ? 'flex-row-reverse' : 'flex-row'">
                  <div class="flex-shrink-0">
                    <div :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white',
                      getSenderColor(msg.senderId)
                    ]">
                      {{ getSenderInitial(msg.senderId) }}
                    </div>
                  </div>
                  <div class="group">
                    <div class="flex items-center gap-2 mb-1" :class="msg.senderId === currentUser ? 'justify-end' : 'justify-start'">
                      <span class="text-xs font-semibold text-slate-600">{{ msg.senderName }}</span>
                    </div>
                    <div 
                      :class="[
                        'px-4 py-2 rounded-2xl',
                        msg.senderId === currentUser 
                          ? 'bg-green-600 text-white rounded-br-sm' 
                          : 'bg-white border border-slate-200 text-gray-700 rounded-bl-sm shadow-sm'
                      ]"
                    >
                      <p class="text-sm break-words">{{ msg.text }}</p>
                    </div>
                    <div class="flex items-center gap-1 mt-1 px-2" :class="msg.senderId === currentUser ? 'justify-end' : 'justify-start'">
                      <span class="text-xs text-slate-400">{{ formatTime(msg.timestamp) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="p-4 border-t border-slate-100 bg-white">
              <div class="flex gap-2">
                <input
                  v-model="newMessage"
                  @keyup.enter="sendMessage"
                  type="text"
                  :placeholder="`Message as ${getCurrentUserName()}...`"
                  class="flex-1 text-gray-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button 
                  @click="sendMessage"
                  :disabled="!newMessage.trim()"
                  class="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition flex items-center gap-2"
                >
                  <Send :size="18" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Waiting for second user -->
        <div v-else-if="users.length === 1" class="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <UserPlus :size="24" class="text-amber-600" />
          </div>
          <h3 class="font-semibold text-gray-800 mb-1">Waiting for second user</h3>
          <p class="text-sm text-slate-600">Create one more user to start chatting</p>
        </div>

        <!-- Info Card -->
        <div class="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div class="flex items-start gap-2">
            <Info :size="20" class="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-semibold text-green-800">How it works:</p>
              <ul class="text-xs text-green-700 mt-1 space-y-1">
                <li>• Create up to 2 users (e.g., Boss and Cherry)</li>
                <li>• Select who you want to chat as from the tabs above</li>
                <li>• All messages appear in the "All Chat" box</li>
                <li>• Switch between users to reply as different people</li>
                <li>• Perfect for testing conversations between two people</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  MessageCircle, Send, User, UserPlus, Info
} from '@lucide/vue'
import Sidebar from '~/components/userStandard/Sidebar.vue'
import Navbar from '~/components/userStandard/Navbar.vue'

const router = useRouter()
const supabase = useSupabaseClient()

interface ChatUser {
  id: string
  name: string
  color: string
}

interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  timestamp: Date
}

// STANDARD PLAN STORAGE KEYS
const STORAGE_KEY_USERS = 'chat_users_standard'
const STORAGE_KEY_MESSAGES = 'chat_messages_standard'

const users = ref<ChatUser[]>([])
const messages = ref<Message[]>([])
const currentUser = ref<string>('')
const newMessage = ref('')
const newUserName = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const checkSubscription = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/loginpage')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const userPlan = (profile as any)?.plan || 'basic'

    console.log('Standard Chat page plan check:', userPlan)

    if (userPlan === 'basic') {
      router.replace('/userBasic/chatuser')
    } else if (userPlan === 'premium') {
      router.replace('/userPremium/ChatUser')
    }
    // standard stays here
  } catch (error) {
    console.error('Error checking subscription:', error)
  }
}

const loadData = (): void => {
  const storedUsers = localStorage.getItem(STORAGE_KEY_USERS)
  if (storedUsers) {
    users.value = JSON.parse(storedUsers)
    if (users.value.length > 0 && !currentUser.value) {
      currentUser.value = users.value[0]?.id || ''
    }
  }
  
  const storedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES)
  if (storedMessages) {
    const parsed = JSON.parse(storedMessages)
    messages.value = parsed.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  }
}

const saveUsers = (): void => {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users.value))
}

const saveMessages = (): void => {
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages.value))
}

const getUserName = (userId: string): string => {
  const user = users.value.find(u => u.id === userId)
  return user ? user.name : ''
}

const createUser = (): void => {
  const name = newUserName.value.trim()
  if (!name || users.value.length >= 2) return
  
  // Updated green theme colors - all green variations
  const colors: string[] = [
    'bg-gradient-to-br from-green-600 to-emerald-600',
    'bg-gradient-to-br from-emerald-600 to-teal-600',
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-emerald-500 to-teal-500',
    'bg-gradient-to-br from-green-600 to-lime-600',
    'bg-gradient-to-br from-teal-600 to-green-600',
    'bg-gradient-to-br from-emerald-600 to-green-600',
    'bg-gradient-to-br from-lime-600 to-emerald-600'
  ]
  
  const newUser: ChatUser = {
    id: Date.now().toString(),
    name: name,
    color: colors[users.value.length % colors.length] || 'bg-gradient-to-br from-green-600 to-emerald-600'
  }
  
  users.value.push(newUser)
  saveUsers()
  newUserName.value = ''
  
  if (!currentUser.value && users.value.length > 0) {
    currentUser.value = users.value[0]?.id || ''
  }
}

const getCurrentUserName = (): string => {
  const user = users.value.find(u => u.id === currentUser.value)
  return user ? user.name : ''
}

const getSenderInitial = (senderId: string): string => {
  const user = users.value.find(u => u.id === senderId)
  return user ? user.name.charAt(0).toUpperCase() : '?'
}

const getSenderColor = (senderId: string): string => {
  const user = users.value.find(u => u.id === senderId)
  if (!user) return 'bg-gradient-to-br from-green-600 to-emerald-600'
  return user.color
}

const sendMessage = (): void => {
  const messageText = newMessage.value.trim()
  if (!messageText || !currentUser.value) return
  
  const sender = users.value.find(u => u.id === currentUser.value)
  if (!sender) return
  
  const message: Message = {
    id: Date.now().toString(),
    text: messageText,
    senderId: currentUser.value,
    senderName: sender.name,
    timestamp: new Date()
  }
  
  messages.value.push(message)
  saveMessages()
  newMessage.value = ''
  scrollToBottom()
}

const scrollToBottom = async (): Promise<void> => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(async () => {
  await checkSubscription()
  loadData()
  scrollToBottom()
})
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>