<script setup lang="ts">
import {
  Home, Building2, ReceiptText,
  BarChart3, LogOut, Droplets,
  PanelLeftClose, PanelLeftOpen, Users2, HandCoins, Bike, MessageCircle, MessageCircleQuestionMark, X
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

const isActive = (path: string) => {
  if (path === route.path) return true
  if (path !== '/userStandard' && route.path.startsWith(path + '/')) return true
  return false
}

const handleLogout = async () => {
  await client.auth.signOut()
  router.push('/loginpage')
}

const mainMenu = [
  { name: 'Dashboard', path: '/userStandard', icon: Home },
  { name: 'DispensePage', path: '/userStandard/Dispense', icon: Droplets },
  { name: 'Salespage', path: '/userStandard/Salespage', icon: Building2 },
  { name: 'Riders',       path: '/userStandard/Riders',          icon: Bike },
  { name: 'Transactions', path: '/userStandard/Transactionpage', icon: ReceiptText },
  { name: 'Reports', path: '/userStandard/Reports', icon: BarChart3 },
  { name: 'Workers', path: '/userStandard/Workers', icon: Users2  },
  { name: 'Subscription', path: '/userStandard/Subscription', icon: HandCoins },
  {name: 'ChatUser', path: '/userStandard/ChatUser', icon: MessageCircle},
  {name: 'HelpGuide', path: '/userStandard/HelpGuide', icon: MessageCircleQuestionMark}
]

// Close the mobile sidebar automatically after navigating, so tapping a
// link doesn't leave the panel open over the new page.
watch(() => route.path, () => {
  closeMobileSidebar()
})

onMounted(() => fetchProfile())
</script>

<template>
  <!--
    Mobile (below md): the sidebar is taken out of the document flow (fixed)
    and translated off-screen by default. Toggling isMobileSidebarOpen (via
    the hamburger button in Navbar.vue) slides it in. Per the chosen layout,
    a matching spacer div (below) pushes the page content to the side when
    open, rather than overlaying with a backdrop.

    Desktop (md and up): behaves exactly as before — sticky, always visible,
    collapsible to an icon-only rail via the PanelLeftClose/Open toggle.
  -->
  <aside
    :class="[
      'h-screen top-0 shrink-0 bg-green-600 border-r border-white/10 text-white flex flex-col transition-all duration-300 z-40',
      'fixed md:sticky',
      isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'md:translate-x-0',
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
              <p class="text-[10px] sm:text-xs text-gray-100 truncate">Water Station System</p>
            </div>
          </Transition>
        </div>

        <!-- Desktop collapse toggle (hidden on mobile, mobile uses the X below) -->
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

        <!-- Mobile close button -->
        <button
          @click="closeMobileSidebar"
          class="md:hidden cursor-pointer p-2 rounded-lg text-gray-100 hover:bg-white/10 transition"
        >
          <PanelLeftClose class="w-5 h-5" />
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
            exact-active-class="bg-white text-green-600"
            class="flex items-center gap-2 md:gap-3 px-2 md:px-3 h-11 rounded-xl transition-all duration-200 text-gray-100 hover:bg-white/25 hover:text-white"
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

  <!--
    Mobile spacer: takes up the same width as the open sidebar so page
    content gets pushed to the side instead of being covered. Width
    animates in step with the sidebar's own transition. Invisible/zero-width
    on desktop since the sidebar is already `sticky` there and part of the
    normal flex layout (see Sidebar usage in each page: `<Sidebar /><main>`).
  -->
  <div
    :class="[
      'shrink-0 transition-all duration-300 md:hidden',
      isMobileSidebarOpen ? 'w-55' : 'w-0'
    ]"
  ></div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>