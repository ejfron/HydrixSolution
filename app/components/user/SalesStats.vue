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
  <div class="grid grid-cols-4 gap-6 w-full">

    <div class="bg-white rounded-3xl border border-slate-200 p-6">
      <p class="text-slate-500 text-sm mb-2 flex items-center gap-2">
        <Calendar :size="14" /> Today
      </p>
      <h2 class="text-2xl font-black text-green-600">₱{{ today.toFixed(2) }}</h2>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200 p-6">
      <p class="text-slate-500 text-sm mb-2 flex items-center gap-2">
        <Calendar :size="14" /> Yesterday
      </p>
      <h2 class="text-2xl font-black text-blue-600">₱{{ yesterday.toFixed(2) }}</h2>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200 p-6">
      <p class="text-slate-500 text-sm mb-2 flex items-center gap-2">
        <TrendingUp :size="14" /> This Month
      </p>
      <h2 class="text-2xl font-black text-violet-600">₱{{ thisMonth.toFixed(2) }}</h2>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200 p-6">
      <p class="text-slate-500 text-sm mb-2 flex items-center gap-2">
        <PhilippinePeso :size="14" /> This Year
      </p>
      <h2 class="text-2xl font-black text-yellow-500">₱{{ thisYear.toFixed(2) }}</h2>
    </div>

  </div>
</template>