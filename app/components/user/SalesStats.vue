<script setup lang="ts">
import { PhilippinePeso, TrendingUp, Calendar } from '@lucide/vue'

defineProps<{
  today: number
  yesterday: number
  thisMonth: number
  thisYear: number
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
    <!-- Today -->
    <div class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6">
      <p class="text-slate-500 text-xs sm:text-sm mb-2 flex items-center gap-2">
        <Calendar :size="14" /> Today
      </p>
      <h2 class="text-xl sm:text-2xl font-black text-green-600">₱{{ today.toFixed(2) }}</h2>
    </div>

    <!-- Yesterday -->
    <div class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6">
      <p class="text-slate-500 text-xs sm:text-sm mb-2 flex items-center gap-2">
        <Calendar :size="14" /> Yesterday
      </p>
      <h2 class="text-xl sm:text-2xl font-black text-blue-600">₱{{ yesterday.toFixed(2) }}</h2>
    </div>

    <!-- This Month -->
    <div class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6">
      <p class="text-slate-500 text-xs sm:text-sm mb-2 flex items-center gap-2">
        <TrendingUp :size="14" /> This Month
      </p>
      <h2 class="text-xl sm:text-2xl font-black text-violet-600">₱{{ thisMonth.toFixed(2) }}</h2>
    </div>

    <!-- This Year -->
    <div class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6">
      <p class="text-slate-500 text-xs sm:text-sm mb-2 flex items-center gap-2">
        <PhilippinePeso :size="14" /> This Year
      </p>
      <h2 class="text-xl sm:text-2xl font-black text-yellow-500">₱{{ thisYear.toFixed(2) }}</h2>
    </div>
  </div>
</template>