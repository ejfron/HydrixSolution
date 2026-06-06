<script setup lang="ts">
import { Users, ChevronDown, LogOut } from '@lucide/vue'

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
  <header class="h-23.75 bg-white border-b border-slate-200 px-4 sm:px-10 flex items-center justify-between">
    <!-- Left side: station dashboard title (responsive text) -->
    <div>
      <h1 class="text-base sm:text-xl font-bold text-slate-900">
        {{ profile?.station_name || 'My Station' }}<br> Dashboard
      </h1>
      <p class="text-slate-500 mt-1 text-xs hidden sm:block">Overview of your water station system</p>
    </div>

    <div class="flex items-center gap-4">
      <div class="relative">
        <div
          class="flex items-center gap-2 sm:gap-4 cursor-pointer"
          @click="showDropdown = !showDropdown"
        >
          <!-- Person icon always visible -->
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-600 flex items-center justify-center text-white">
            <Users :size="20" />
          </div>

          <!-- Station name & email: hidden on mobile, visible from sm/md -->
          <div class="hidden sm:block">
            <h3 class="font-bold text-green-600">
              {{ profile?.station_name || 'My Station' }}
            </h3>
            <p class="text-sm text-slate-500">{{ user?.email }}</p>
          </div>

          <!-- Chevron: hidden on mobile, visible from sm -->
          <ChevronDown
            class="hidden sm:block w-5 h-5 text-slate-500 transition-transform duration-200"
            :class="showDropdown ? 'rotate-180' : ''"
          />
        </div>

        <!-- Dropdown (unchanged) -->
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
            <div class="px-4 py-3 border-b border-slate-100">
              <p class="text-sm font-semibold text-slate-800">
                {{ profile?.station_name || 'My Station' }}
              </p>
              <p class="text-xs text-slate-500 truncate">{{ user?.email }}</p>
            </div>

            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut class="w-4 h-4" />
              Logout
            </button>
          </div>
        </Transition>

        <div
          v-if="showDropdown"
          class="fixed inset-0 z-40"
          @click="showDropdown = false"
        />
      </div>
    </div>
  </header>
</template>