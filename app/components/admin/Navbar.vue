<script setup lang="ts">
import { Search, Users, ChevronDown, LogOut, Bell } from '@lucide/vue'

const client = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()
const { profile, fetchProfile } = useProfile()

const showDropdown = ref(false)
const searchQuery = ref('')

onMounted(async () => {
  await fetchProfile()
})

const handleLogout = async () => {
  await client.auth.signOut()
  router.push('/loginpage')
}

const today = new Date().toLocaleDateString('en-PH', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})
</script>

<template>
  <header class="h-[70px] bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0">

    <!-- Left: Dashboard name stays visible on all screen sizes -->
    <div>
      <h1 class="text-base font-bold text-slate-800">Admin Dashboard</h1>
      <p class="text-xs text-slate-400 mt-0.5">{{ today }}</p>
    </div>

    <!-- Right: Responsive controls -->
    <div class="flex items-center gap-3">

      <!-- Search: hidden on mobile, visible from md breakpoint upwards -->
      <div class="hidden md:flex w-[240px] h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 items-center gap-2">
        <Search class="w-4 h-4 text-slate-400 shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="bg-transparent text-slate-600 outline-none flex-1 text-sm placeholder:text-slate-400"
        />
      </div>

      <!-- Bell icon (always visible) -->
      <button class="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition cursor-pointer relative">
        <Bell class="w-4 h-4 text-slate-500" />
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-500" />
      </button>

      <!-- Divider: hidden on mobile, visible from md -->
      <div class="hidden md:block w-px h-6 bg-slate-200" />

      <!-- Profile dropdown -->
      <div class="relative">
        <button
          @click="showDropdown = !showDropdown"
          class="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 rounded-xl px-2 py-1.5 transition"
        >
          <!-- Person icon (always visible) -->
          <div class="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white shrink-0">
            <Users :size="16" />
          </div>
          
          <!-- Station name & email: hidden on mobile, visible from md -->
          <div class="hidden md:block text-left">
            <p class="text-sm font-semibold text-slate-700 leading-tight">
              {{ profile?.station_name || 'Admin' }}
            </p>
            <p class="text-[11px] text-slate-400 truncate max-w-[120px]">{{ user?.email }}</p>
          </div>
          
          <!-- Chevron: hidden on mobile, visible from md -->
          <ChevronDown
            class="hidden md:block w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="showDropdown ? 'rotate-180' : ''"
          />
        </button>

        <!-- Dropdown menu (unchanged) -->
        <Transition
          enter-active-class="transition ease-out duration-150"
          enter-from-class="opacity-0 scale-95 translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showDropdown"
            class="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-lg border border-slate-100 py-1.5 z-50 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-slate-100">
              <p class="text-sm font-semibold text-slate-800">{{ profile?.station_name || 'Admin' }}</p>
              <p class="text-xs text-slate-400 truncate mt-0.5">{{ user?.email }}</p>
            </div>
            <div class="p-1.5">
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition cursor-pointer"
              >
                <LogOut class="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </Transition>

        <div v-if="showDropdown" class="fixed inset-0 z-40" @click="showDropdown = false" />
      </div>
    </div>
  </header>
</template>