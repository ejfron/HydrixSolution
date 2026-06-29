<script setup lang="ts">
import {
  Home, Building2, ReceiptText,
  BarChart3, LogOut, Droplets,
  PanelLeftClose, PanelLeftOpen, Users2, HandCoins, Bike, MessageCircle, MessageCircleQuestionMark
} from '@lucide/vue'
import { useRoute } from '#app'
import { useSidebarState } from '~/composables/useSidebarState'

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const { profile, fetchProfile } = useProfile()
const { isMobileSidebarOpen, closeMobileSidebar } = useSidebarState()

const OpenSidebar = ref(true)
const OpenSidebarMenu = () => OpenSidebar.value = !OpenSidebar.value

// Normalize path for comparison
const isActive = (path: string) => {
  const currentPath = route.path
  const normalizedCurrent = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath
  const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path

  if (normalizedCurrent === normalizedPath) return true
  if (path !== '/userPremium' && normalizedCurrent.startsWith(normalizedPath + '/')) return true
  return false
}

const handleLogout = async () => {
  await client.auth.signOut()
  router.push('/loginpage')
}

// Main menu items for desktop sidebar - PREMIUM
const mainMenu = [
  { name: 'Dashboard', path: '/userPremium', icon: Home },
  { name: 'LogBook', path: '/userPremium/dispense', icon: Droplets },
  { name: 'Salespage', path: '/userPremium/salespage', icon: Building2 },
  { name: 'Riders', path: '/userPremium/riders', icon: Bike },
  { name: 'Transactions', path: '/userPremium/transactionpage', icon: ReceiptText },
  { name: 'Reports', path: '/userPremium/reports', icon: BarChart3 },
  { name: 'Workers', path: '/userPremium/workers', icon: Users2 },
  { name: 'Subscription', path: '/userPremium/subscription', icon: HandCoins },
  { name: 'ChatUser', path: '/userPremium/chatuser', icon: MessageCircle },
  { name: 'HelpGuide', path: '/userPremium/HelpGuide', icon: MessageCircleQuestionMark },
]

// Mobile bottom navigation items - PREMIUM
const bottomNavItems = [
  { name: 'Dashboard', path: '/userPremium', icon: Home },
  { name: 'LogBook', path: '/userPremium/dispense', icon: Droplets },
  { name: 'Sales', path: '/userPremium/salespage', icon: Building2 },
  { name: 'Riders', path: '/userPremium/riders', icon: Bike },
  { name: 'Transactions', path: '/userPremium/transactionpage', icon: ReceiptText },
  { name: 'Reports', path: '/userPremium/reports', icon: BarChart3 },
  { name: 'Customers', path: '/userPremium/workers', icon: Users2 },
  { name: 'Subscription', path: '/userPremium/subscription', icon: HandCoins },
  { name: 'Chat', path: '/userPremium/chatuser', icon: MessageCircle },
  { name: 'Help', path: '/userPremium/HelpGuide', icon: MessageCircleQuestionMark },
]

watch(() => route.path, () => {
  closeMobileSidebar()
})

onMounted(() => {
  fetchProfile()
  console.log('Current route:', route.path)
})
</script>

<template>
  <!-- Desktop Sidebar (hidden on mobile) -->
  <aside
    :class="[
      'hidden md:flex h-screen top-0 shrink-0 bg-green-600 border-r border-white/10 text-white flex-col transition-all duration-300 z-40 sticky',
      OpenSidebar ? 'w-55 md:w-67.5' : 'w-55 md:w-19.5'
    ]"
  >
    <div class="flex-1 overflow-y-auto">
      <!-- Header -->
      <div class="h-16 border-b border-white/10 flex items-center px-3 md:px-4 justify-between">
        <div class="flex items-center gap-2 md:gap-3 min-w-0">
          <div class="min-w-9 w-9 h-9 md:min-w-10.5 md:w-10.5 md:h-10.5 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Droplets class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>

          <Transition name="fade">
            <div v-if="OpenSidebar" class="truncate">
              <h1 class="font-semibold text-xs sm:text-sm">
                {{ profile?.station_name || 'My Station' }}
              </h1>
              <p class="text-[10px] sm:text-xs text-gray-100 truncate">Premium Plan</p>
            </div>
          </Transition>
        </div>

        <!-- Desktop collapse toggle -->
        <button
          @click="OpenSidebarMenu"
          :class="[
            'hidden md:inline-flex cursor-pointer p-2 rounded-lg transition',
            OpenSidebar ? '' : 'ml-8 md:ml-12 bg-gray-100 text-green-600',
          ]"
        >
          <PanelLeftClose v-if="OpenSidebar" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-100" />
          <PanelLeftOpen v-else class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <!-- Menu -->
      <div class="px-2 md:px-3 py-4">
        <p
          v-if="OpenSidebar"
          class="px-3 mb-2 text-[10px] sm:text-[11px] font-semibold text-gray-100 uppercase tracking-widest"
        >
          Main
        </p>

        <div class="space-y-1">
          <NuxtLink
            v-for="item in mainMenu"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-2 md:gap-3 px-2 md:px-3 h-11 rounded-xl transition-all duration-200 text-gray-100 hover:bg-white/10 hover:text-white',
              isActive(item.path) ? 'bg-white text-green-600' : ''
            ]"
          >
            <component :is="item.icon" class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <Transition name="fade">
              <span v-if="OpenSidebar" class="text-xs sm:text-sm font-medium whitespace-nowrap">
                {{ item.name }}
              </span>
            </Transition>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Logout -->
    <div class="border-t border-white/10 p-2 md:p-3">
      <button
        @click="handleLogout"
        class="w-full h-11 rounded-xl flex items-center gap-2 md:gap-3 px-2 md:px-3 text-gray-100 cursor-pointer hover:bg-red-500/10 hover:text-red-400 transition"
      >
        <LogOut class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        <Transition name="fade">
          <span v-if="OpenSidebar" class="text-xs sm:text-sm font-medium">Logout</span>
        </Transition>
      </button>
    </div>
  </aside>

  <!-- Mobile Bottom Navigation -->
  <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-lg">
    <div class="overflow-x-auto scrollbar-hide">
      <div class="flex items-center h-16 px-2 gap-1 min-w-max">
        <NuxtLink
          v-for="item in bottomNavItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 relative shrink-0"
          :class="[
            isActive(item.path) 
              ? 'text-green-600' 
              : 'text-slate-400 hover:text-slate-600'
          ]"
        >
          <div 
            v-if="isActive(item.path)" 
            class="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-green-600 rounded-full"
          ></div>
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-[10px] font-medium whitespace-nowrap">{{ item.name }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- Spacer for mobile bottom nav -->
  <div class="md:hidden h-16"></div>

  <!-- Mobile sidebar overlay -->
  <div
    v-if="isMobileSidebarOpen"
    class="md:hidden fixed inset-0 bg-black/50 z-30"
    @click="closeMobileSidebar"
  ></div>
</template>

<style scoped>
.fade-enter-active, 
.fade-leave-active { 
  transition: opacity 0.15s ease; 
}

.fade-enter-from, 
.fade-leave-to { 
  opacity: 0; 
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>