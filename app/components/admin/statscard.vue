<script setup lang="ts">
import { Droplets, Users, PhilippinePeso, AlertCircle, ReceiptText } from '@lucide/vue'
import { useSupabaseClient } from '#imports'

const client = useSupabaseClient()

const totalStations = ref(0)
const totalUsers = ref(0)
const totalSales = ref(0)
const totalTransactions = ref(0)
const expiredCount = ref(0)

const fetchStats = async () => {
  const { count: stationsCount } = await client
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user')

  const { count: expired } = await client
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user')
    .eq('subscription_status', 'expired')

  const { data: salesData } = await client
    .from('transactions')
    .select('total_amount')
    .eq('status', 'completed')
    .returns<{ total_amount: number }[]>()

  const { count: transCount } = await client
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  totalStations.value = stationsCount ?? 0
  totalUsers.value = stationsCount ?? 0
  expiredCount.value = expired ?? 0
  totalTransactions.value = transCount ?? 0
  totalSales.value = salesData?.reduce((sum, t) => sum + Number(t.total_amount), 0) ?? 0
}

onMounted(() => fetchStats())
</script>

<template>
  <!-- 2 cols on mobile, 3 on md, 5 on xl -->
  <section class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">

    <!-- Total Stations -->
    <div class="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
      <div class="flex items-center justify-between">
        <p class="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wide">Stations</p>
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Droplets class="text-blue-500" :size="14" />
        </div>
      </div>
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-800">{{ totalStations }}</h2>
        <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">Active water stations</p>
      </div>
    </div>

    <!-- Total Users -->
    <div class="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
      <div class="flex items-center justify-between">
        <p class="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wide">Users</p>
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
          <Users class="text-violet-500" :size="14" />
        </div>
      </div>
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-800">{{ totalUsers }}</h2>
        <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">Registered clients</p>
      </div>
    </div>

    <!-- Total Transactions -->
    <div class="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
      <div class="flex items-center justify-between">
        <p class="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wide">Transactions</p>
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
          <ReceiptText class="text-green-500" :size="14" />
        </div>
      </div>
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-800">{{ totalTransactions }}</h2>
        <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">Completed dispenses</p>
      </div>
    </div>

    <!-- Total Sales -->
    <div class="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
      <div class="flex items-center justify-between">
        <p class="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wide">Revenue</p>
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
          <PhilippinePeso class="text-yellow-500" :size="14" />
        </div>
      </div>
      <div>
        <h2 class="text-lg sm:text-2xl font-black text-slate-800 leading-tight">
          ₱{{ totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}
        </h2>
        <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">Total revenue</p>
      </div>
    </div>

    <!-- Expired — full width on mobile when odd -->
    <div
      :class="[
        'rounded-2xl border p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 col-span-2 md:col-span-1 transition',
        expiredCount > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'
      ]"
    >
      <div class="flex items-center justify-between">
        <p :class="['text-[10px] sm:text-xs font-medium uppercase tracking-wide', expiredCount > 0 ? 'text-red-400' : 'text-slate-400']">
          Expired Subs
        </p>
        <div :class="['w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0', expiredCount > 0 ? 'bg-red-100' : 'bg-slate-100']">
          <AlertCircle :class="expiredCount > 0 ? 'text-red-500' : 'text-slate-400'" :size="14" />
        </div>
      </div>
      <div>
        <h2 :class="['text-xl sm:text-2xl font-black', expiredCount > 0 ? 'text-red-600' : 'text-slate-800']">
          {{ expiredCount }}
        </h2>
        <p :class="['text-[10px] sm:text-xs mt-0.5', expiredCount > 0 ? 'text-red-400' : 'text-slate-400']">
          Need renewal
        </p>
      </div>
    </div>

  </section>
</template>