<script setup lang="ts">
import { useSupabaseClient } from '#imports'

const client = useSupabaseClient()

const users = ref<{
  id: string
  full_name: string
  station_name: string
  email: string
  role: string
  created_at: string
}[]>([])

const loading = ref(true)

const fetchUsers = async () => {
  loading.value = true

  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, station_name, email, role, created_at')
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  console.log('users data:', data)
  console.log('users error:', error)

  if (data) users.value = data
  loading.value = false
}

onMounted(() => fetchUsers())
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-3xl overflow-hidden">
    <div class="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
      <div>
        <h2 class="text-l font-bold text-green-600">USER'S DATA</h2>
      </div>

      <button
        @click="fetchUsers"
        class="px-5 py-3 cursor-pointer text-gray-700 border-green-600 rounded-2xl border text-sm font-semibold hover:bg-green-50 transition"
      >
        Refresh
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="px-8 py-10 text-center text-slate-400 text-sm">
      Loading users...
    </div>

    <!-- Empty -->
    <div v-else-if="users.length === 0" class="px-8 py-10 text-center text-slate-400 text-sm">
      No users registered yet.
    </div>

    <!-- Table -->
    <table v-else class="w-full">
      <thead class="bg-slate-50">
        <tr class="text-gray-700 text-xs">
          <th class="text-left px-8 py-5">Name</th>
          <th class="text-left px-8 py-5">Station Name</th>
          <th class="text-left px-8 py-5">Email</th>
          <th class="text-left px-8 py-5">Role</th>
          <th class="text-left px-8 py-5">Joined</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="user in users"
          :key="user.id"
          class="border-b border-slate-100 text-gray-700 text-xs"
        >
          <td class="px-8 py-6">{{ user.full_name || '—' }}</td>
          <td class="px-8 py-6">{{ user.station_name || '—' }}</td>
          <td class="px-8 py-6">{{ user.email }}</td>
          <td class="px-8 py-6">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              {{ user.role }}
            </span>
          </td>
          <td class="px-8 py-6">
            {{ new Date(user.created_at).toLocaleDateString('en-PH', {
              year: 'numeric', month: 'short', day: 'numeric'
            }) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>