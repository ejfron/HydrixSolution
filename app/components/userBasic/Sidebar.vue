<script setup lang="ts">
import {
  Home, Building2, ReceiptText,
  BarChart3, LogOut, Droplets,
  PanelLeftClose, PanelLeftOpen, Users2, HandCoins, Bike, MessageCircle
} from '@lucide/vue'
import { useRoute } from '#app'

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const { profile, fetchProfile } = useProfile()

const OpenSidebar = ref(true)
const OpenSidebarMenu = () => OpenSidebar.value = !OpenSidebar.value

// Normalize path for comparison (remove trailing slash, ensure consistency)
const isActive = (path: string) => {
  const currentPath = route.path
  // Normalize both paths by removing trailing slash if exists
  const normalizedCurrent = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath
  const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path
  
  if (normalizedCurrent === normalizedPath) return true
  if (path !== '/userBasic' && normalizedCurrent.startsWith(normalizedPath + '/')) return true
  return false
}

const handleLogout = async () => {
  await client.auth.signOut()
  router.push('/loginpage')
}

// FIX: Make sure paths match exactly with your actual routes
const mainMenu = [
  { name: 'Dashboard', path: '/userBasic', icon: Home },
  { name: 'DispensePage', path: '/userBasic/dispense', icon: Droplets }, // lowercase d
  { name: 'Salespage', path: '/userBasic/salespage', icon: Building2 }, // lowercase s
  { name: 'Riders', path: '/userBasic/riders', icon: Bike }, // lowercase r
  { name: 'Transactions', path: '/userBasic/transactionpage', icon: ReceiptText }, // lowercase t
  { name: 'Reports', path: '/userBasic/reports', icon: BarChart3 }, // lowercase r
  { name: 'Workers', path: '/userBasic/workers', icon: Users2 }, // lowercase w
  { name: 'Subscription', path: '/userBasic/subscription', icon: HandCoins }, // lowercase s
  { name: 'ChatUser', path: '/userBasic/chatuser', icon: MessageCircle } // lowercase c

]

onMounted(() => {
  fetchProfile()
  console.log('Current route:', route.path) // Debug: check what route you're on
})
</script>

<template>
  <aside
    :class="[
      'h-screen sticky top-0 shrink-0 bg-green-600 border-r border-white/10 text-white flex flex-col transition-all duration-300',
      OpenSidebar ? 'w-55 md:w-67.5' : 'w-16 md:w-19.5'
    ]"
  >
    <div class="flex-1">
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
              <p class="text-[10px] sm:text-xs text-gray-100 truncate">Water Station System</p>
            </div>
          </Transition>
        </div>

        <button
          @click="OpenSidebarMenu"
          :class="[
            'cursor-pointer p-2 rounded-lg transition',
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
</style>