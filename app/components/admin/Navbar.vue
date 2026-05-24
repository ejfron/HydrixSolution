<script setup lang="ts">
import { Search, Users, ChevronDown, LogOut } from '@lucide/vue'

const client = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()
const { profile, fetchProfile } = useProfile()

const showDropdown = ref(false)

onMounted(async () => {
  await fetchProfile()
})

const handleLogout = async () => {
  await client.auth.signOut()
  router.push('/loginpage')
}
</script>

<template>
  <header class="h-[95px] bg-white border-b border-slate-200 px-10 flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-slate-900">Admin Dashboard</h1>
      <p class="text-slate-500 mt-1 text-xs">Overview of your water station system</p>
    </div>

    <div class="flex items-center gap-6">
      <div class="w-[320px] h-[40px] rounded-2xl border border-slate-200 bg-[#f8fafc] px-5 flex items-center gap-3">
        <Search class="w-5 h-5 text-gray-700" />
        <input
          type="text"
          placeholder="Search anything..."
          class="bg-transparent text-gray-700 outline-none flex-1 text-sm"
        />
      </div>

      <!-- Profile + Dropdown -->
      <div class="relative">
        <div
          class="flex items-center gap-4 cursor-pointer"
          @click="showDropdown = !showDropdown"
        >
          <div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
            <Users :size="20" />
          </div>

          <div>
            <h3 class="font-bold text-green-600">{{ profile?.station_name || 'Admin' }}</h3>
            <p class="text-sm text-gray-500">{{ user?.email }}</p>
          </div>

          <ChevronDown
            class="w-5 h-5 text-slate-500 transition-transform duration-200"
            :class="showDropdown ? 'rotate-180' : ''"
          />
        </div>

        <!-- Dropdown -->
        <Transition
          enter-active-class="transition ease-out duration-150"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-if="showDropdown"
            class="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
          >
            <!-- User info -->
            <div class="px-4 py-3 border-b border-slate-100">
              <p class="text-sm font-semibold text-slate-800">
                {{ profile?.station_name || 'Admin' }}
              </p>
              <p class="text-xs text-slate-500 truncate">{{ user?.email }}</p>
            </div>

            <!-- Logout -->
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut class="w-4 h-4" />
              Logout
            </button>
          </div>
        </Transition>

        <!-- Click outside to close -->
        <div
          v-if="showDropdown"
          class="fixed inset-0 z-40"
          @click="showDropdown = false"
        />
      </div>
    </div>
  </header>
</template>