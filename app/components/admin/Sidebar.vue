<script setup lang="ts">
import {
  Home, Building2, Users, ReceiptText,
  BarChart3, Settings, ShieldCheck,
  FileText, DatabaseBackup, LogOut,
  Droplets, PanelLeftClose, PanelLeftOpen,
} from '@lucide/vue'
import { useRoute } from '#app'

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()

const OpenSidebar = defineModel<boolean>({ default: true })
const showLogoutModal = ref(false)

const OpenSidebarMenu = () => OpenSidebar.value = !OpenSidebar.value

const isActive = (path: string) => {
  if (path === route.path) return true
  if (path !== '/admin' && route.path.startsWith(path + '/')) return true
  return false
}

const handleLogout = async () => {
  await client.auth.signOut()
  router.push('/loginpage')
}

const mainMenu = [
  { name: 'Dashboard',    path: '/admin',                 icon: Home },
  { name: 'Stations',     path: '/admin/Stations',         icon: Building2 },
  { name: 'Users',        path: '/admin/users',           icon: Users },
  { name: 'Transactions', path: '/admin/Transactionpage', icon: ReceiptText },
  { name: 'Reports',      path: '/admin/Reports',         icon: BarChart3 },
]

const systemMenu = [
  { name: 'Settings',        path: '/admin/settings',    icon: Settings },
  { name: 'Audit Logs',      path: '/admin/audit-logs',  icon: ShieldCheck },
  { name: 'System Logs',     path: '/admin/systemLogs',  icon: FileText },
  { name: 'Backup & Restore',path: '/admin/backup',      icon: DatabaseBackup },
]
</script>

<template>
  <aside
    :class="[
      OpenSidebar ? 'w-[270px]' : 'w-[78px]',
      'h-screen sticky top-0 shrink-0 bg-green-600 border-r border-white/10 text-white flex flex-col transition-all duration-300'
    ]"
  >
    <div class="flex-1">
      <!-- Header -->
      <div class="h-16 border-b border-white/10 flex items-center px-4 justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="min-w-[42px] w-[42px] h-[42px] rounded-xl bg-emerald-500 flex items-center justify-center">
            <Droplets class="w-5 h-5 text-white" />
          </div>

          <Transition name="fade">
            <div v-if="OpenSidebar" class="truncate">
              <h1 class="font-semibold text-sm">Hydrix</h1>
              <p class="text-xs text-gray-100 truncate">Water Station System</p>
            </div>
          </Transition>
        </div>

        <button
          @click="OpenSidebarMenu"
          :class="[OpenSidebar ? '' : 'ml-12 bg-gray-100 text-green-600', 'cursor-pointer p-2 rounded-lg transition']"
        >
          <PanelLeftClose v-if="OpenSidebar" class="w-5 h-5 text-gray-100" />
          <PanelLeftOpen v-else class="w-5 h-5" />
        </button>
      </div>

      <!-- Main Menu -->
      <div class="px-3 py-4">
        <p v-if="OpenSidebar" class="px-3 mb-2 text-[11px] font-semibold text-gray-100 uppercase tracking-widest">
          Main
        </p>

        <div class="space-y-1">
          <NuxtLink
            v-for="item in mainMenu"
            :key="item.path"
            :to="item.path"
            :class="[
              isActive(item.path) ? 'bg-white text-green-600' : 'text-gray-100 hover:bg-white/25 hover:text-white',
              'flex items-center gap-3 px-3 h-11 rounded-xl transition-all duration-200'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 shrink-0" />
            <Transition name="fade">
              <span v-if="OpenSidebar" class="text-sm font-medium whitespace-nowrap">
                {{ item.name }}
              </span>
            </Transition>
          </NuxtLink>
        </div>
      </div>

      <!-- System Menu -->
      <div class="px-3 py-2">
        <p v-if="OpenSidebar" class="px-3 mb-2 text-[11px] font-semibold text-gray-100 uppercase tracking-widest">
          System
        </p>

        <div class="space-y-1">
          <NuxtLink
            v-for="item in systemMenu"
            :key="item.path"
            :to="item.path"
            :class="[
              isActive(item.path) ? 'bg-white text-green-600' : 'text-gray-100 hover:bg-white/25 hover:text-white',
              'flex items-center gap-3 px-3 h-11 rounded-xl transition-all duration-200'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 shrink-0" />
            <Transition name="fade">
              <span v-if="OpenSidebar" class="text-sm font-medium whitespace-nowrap">
                {{ item.name }}
              </span>
            </Transition>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Logout -->
    <div class="border-t border-white/10 p-3">
      <button
        @click="handleLogout"
        class="w-full h-11 rounded-xl flex items-center gap-3 px-3 text-gray-100 cursor-pointer hover:bg-red-500/10 hover:text-red-400 transition"
      >
        <LogOut class="w-5 h-5 shrink-0" />
        <Transition name="fade">
          <span v-if="OpenSidebar" class="text-sm font-medium">Logout</span>
        </Transition>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>