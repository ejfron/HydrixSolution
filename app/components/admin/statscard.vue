<script setup lang="ts">
import { Droplets, Eye, Users, PhilippinePeso } from '@lucide/vue'
import { useSupabaseClient } from '#imports'

const client = useSupabaseClient()

const totalStations = ref(0)
const totalUsers = ref(0)
const totalSales = ref(0)

const fetchStats = async () => {
  // Total stations (users with role = 'user')
  const { count: stationsCount } = await client
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user')

  // Total users (same as stations in your system)
  const { count: usersCount } = await client
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user')

  // Total sales from transactions
  const { data: salesData } = await client
    .from('transactions')
    .select('amount')

  const transactions = salesData as Array<{ amount: number | string | null }> | null

  totalStations.value = stationsCount ?? 0
  totalUsers.value = usersCount ?? 0
  totalSales.value = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0
}

onMounted(() => fetchStats())
</script>

<template>
  <section class="grid grid-cols-4 gap-6">

    <!-- Total Stations -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between">
      <div>
        <p class="text-slate-500 mb-2">Total Stations</p>
        <h2 class="text-xl text-gray-700 font-bold">{{ totalStations }}</h2>
      </div>
      <div class="w-15 h-15 rounded-full bg-blue-600 flex items-center justify-center">
        <Droplets class="text-white" :size="30" />
      </div>
    </div>

    <!-- Total Users -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between">
      <div>
        <p class="text-slate-500 mb-2">Total Users</p>
        <h2 class="text-xl text-gray-700 font-bold">{{ totalUsers }}</h2>
      </div>
      <div class="w-15 h-15 rounded-full bg-violet-600 flex items-center justify-center">
        <Users class="text-white" :size="30" />
      </div>
    </div>

    <!-- Total Transactions -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between">
      <div>
        <p class="text-slate-500 mb-2">Total Transactions</p>
        <h2 class="text-xl text-gray-700 font-bold">
          {{ totalSales > 0 ? totalSales : '0' }}
        </h2>
      </div>
      <div class="w-15 h-15 rounded-full bg-green-500 flex items-center justify-center">
        <Eye class="text-white" :size="30" />
      </div>
    </div>

    <!-- Total Sales -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between">
      <div>
        <p class="text-slate-500 mb-2">Total Sales</p>
        <h2 class="text-xl text-gray-700 font-bold">
          ₱{{ totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}
        </h2>
      </div>
      <div class="w-15 h-15 rounded-full bg-yellow-500 flex items-center justify-center">
        <PhilippinePeso class="text-white" :size="30" />
      </div>
    </div>

  </section>
</template>