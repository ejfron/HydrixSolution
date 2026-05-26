<script setup lang="ts">
import { useSupabaseClient } from '#imports'

const client = useSupabaseClient()

const users = ref<{
  id: string
  full_name: string
  station_name: string
  email: string
  role: string
  location: string
  created_at: string
  subscription_status: string
  next_payment_date: string | null
}[]>([])

const loading = ref(true)

const fetchUsers = async () => {
  loading.value = true
  const { data } = await client
    .from('profiles')
    .select('id, full_name, station_name, email, role, location, created_at, subscription_status, next_payment_date')
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  if (data) users.value = data as any
  loading.value = false
}

onMounted(() => fetchUsers())
</script>

<template>
  <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden">

    <!-- Header -->
    <div class="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <div>
        <h2 class="text-sm font-bold text-slate-800">User Data</h2>
        <p class="text-xs text-slate-400 mt-0.5">All registered station clients</p>
      </div>
      <button
        @click="fetchUsers"
        class="px-3 sm:px-4 py-2 text-xs font-semibold text-green-600 border border-green-200 rounded-xl hover:bg-green-50 transition cursor-pointer"
      >
        Refresh
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="px-6 py-12 text-center text-slate-400 text-sm">
      Loading users...
    </div>

    <!-- Empty -->
    <div v-else-if="users.length === 0" class="px-6 py-12 text-center text-slate-400 text-sm">
      No users registered yet.
    </div>

    <!-- Desktop Table -->
    <div v-else class="hidden sm:block overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Name</th>
            <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Station</th>
            <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Email</th>
            <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Location</th>
            <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Subscription</th>
            <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Due Date</th>
            <th class="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Joined</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr
            v-for="user in users"
            :key="user.id"
            class="hover:bg-slate-50/50 transition"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold shrink-0">
                  {{ (user.full_name || user.email).charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-slate-700">{{ user.full_name || '—' }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ user.station_name || '—' }}</td>
            <td class="px-6 py-4 text-sm text-slate-500">{{ user.email }}</td>
            <td class="px-6 py-4 text-sm text-slate-500">{{ user.location || '—' }}</td>
            <td class="px-6 py-4">
              <span :class="['px-2.5 py-1 rounded-lg text-[11px] font-semibold', user.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600']">
                {{ user.subscription_status || '—' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span :class="['text-sm', user.subscription_status === 'expired' ? 'text-red-500 font-semibold' : 'text-slate-500']">
                {{ user.next_payment_date || '—' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-slate-400">
              {{ new Date(user.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div v-if="!loading && users.length > 0" class="sm:hidden divide-y divide-slate-100">
      <div
        v-for="user in users"
        :key="user.id"
        class="p-4 space-y-3"
      >
        <!-- Top row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold shrink-0">
              {{ (user.full_name || user.email).charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ user.full_name || '—' }}</p>
              <p class="text-xs text-slate-400">{{ user.station_name || '—' }}</p>
            </div>
          </div>
          <span :class="['px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0', user.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600']">
            {{ user.subscription_status || '—' }}
          </span>
        </div>

        <!-- Details grid -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p class="text-slate-400">Email</p>
            <p class="text-slate-600 truncate">{{ user.email }}</p>
          </div>
          <div>
            <p class="text-slate-400">Location</p>
            <p class="text-slate-600">{{ user.location || '—' }}</p>
          </div>
          <div>
            <p class="text-slate-400">Due Date</p>
            <p :class="user.subscription_status === 'expired' ? 'text-red-500 font-semibold' : 'text-slate-600'">
              {{ user.next_payment_date || '—' }}
            </p>
          </div>
          <div>
            <p class="text-slate-400">Joined</p>
            <p class="text-slate-600">
              {{ new Date(user.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) }}
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>