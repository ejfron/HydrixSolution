<script setup lang="ts">
import { PhilippinePeso, TrendingUp, Calendar, AlertCircle, Ban, Clock } from '@lucide/vue'

defineProps<{
  today: number
  yesterday: number
  thisMonth: number
  thisYear: number
  unpaidToday?: number
  unpaidYesterday?: number
  unpaidThisMonth?: number
  unpaidThisYear?: number
}>()
</script>

<template>
  <div class="space-y-4">
    <!-- Paid Sales Section -->
    <div>
      <div class="flex items-center gap-2 mb-3">
        <div class="w-1 h-5 bg-green-500 rounded-full"></div>
        <h3 class="text-sm font-semibold text-gray-600">Collected Sales (Paid)</h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        <!-- Today Paid -->
        <div class="bg-white rounded-3xl border border-green-200 p-4 sm:p-6">
          <p class="text-slate-500 text-xs sm:text-sm mb-2 flex items-center gap-2">
            <Calendar :size="14" /> Today
          </p>
          <h2 class="text-xl sm:text-2xl font-black text-green-600">₱{{ today.toFixed(2) }}</h2>
          <p class="text-xs text-green-500 mt-1">Money collected</p>
        </div>

        <!-- Yesterday Paid -->
        <div class="bg-white rounded-3xl border border-blue-200 p-4 sm:p-6">
          <p class="text-slate-500 text-xs sm:text-sm mb-2 flex items-center gap-2">
            <Calendar :size="14" /> Yesterday
          </p>
          <h2 class="text-xl sm:text-2xl font-black text-blue-600">₱{{ yesterday.toFixed(2) }}</h2>
          <p class="text-xs text-blue-500 mt-1">Money collected</p>
        </div>

        <!-- This Month Paid -->
        <div class="bg-white rounded-3xl border border-violet-200 p-4 sm:p-6">
          <p class="text-slate-500 text-xs sm:text-sm mb-2 flex items-center gap-2">
            <TrendingUp :size="14" /> This Month
          </p>
          <h2 class="text-xl sm:text-2xl font-black text-violet-600">₱{{ thisMonth.toFixed(2) }}</h2>
          <p class="text-xs text-violet-500 mt-1">Money collected</p>
        </div>

        <!-- This Year Paid -->
        <div class="bg-white rounded-3xl border border-yellow-200 p-4 sm:p-6">
          <p class="text-slate-500 text-xs sm:text-sm mb-2 flex items-center gap-2">
            <PhilippinePeso :size="14" /> This Year
          </p>
          <h2 class="text-xl sm:text-2xl font-black text-yellow-500">₱{{ thisYear.toFixed(2) }}</h2>
          <p class="text-xs text-yellow-500 mt-1">Money collected</p>
        </div>
      </div>
    </div>

    <!-- Unpaid Sales Section -->
    <div v-if="unpaidToday && unpaidToday > 0 || unpaidYesterday && unpaidYesterday > 0 || unpaidThisMonth && unpaidThisMonth > 0 || unpaidThisYear && unpaidThisYear > 0">
      <div class="flex items-center gap-2 mb-3 mt-4">
        <div class="w-1 h-5 bg-red-500 rounded-full"></div>
        <h3 class="text-sm font-semibold text-gray-600">Uncollected Sales (Utang)</h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        <!-- Today Unpaid -->
        <div class="bg-red-50 rounded-3xl border border-red-200 p-4 sm:p-6">
          <p class="text-red-600 text-xs sm:text-sm mb-2 flex items-center gap-2">
            <Clock :size="14" /> Today (Pending)
          </p>
          <h2 class="text-xl sm:text-2xl font-black text-red-600">₱{{ (unpaidToday || 0).toFixed(2) }}</h2>
          <p class="text-xs text-red-500 mt-1 flex items-center gap-1"><Ban :size="12" /> Not yet collected</p>
        </div>

        <!-- Yesterday Unpaid -->
        <div class="bg-red-50 rounded-3xl border border-red-200 p-4 sm:p-6">
          <p class="text-red-600 text-xs sm:text-sm mb-2 flex items-center gap-2">
            <Clock :size="14" /> Yesterday (Pending)
          </p>
          <h2 class="text-xl sm:text-2xl font-black text-red-600">₱{{ (unpaidYesterday || 0).toFixed(2) }}</h2>
          <p class="text-xs text-red-500 mt-1 flex items-center gap-1"><Ban :size="12" /> Not yet collected</p>
        </div>

        <!-- This Month Unpaid -->
        <div class="bg-red-50 rounded-3xl border border-red-200 p-4 sm:p-6">
          <p class="text-red-600 text-xs sm:text-sm mb-2 flex items-center gap-2">
            <Clock :size="14" /> This Month (Pending)
          </p>
          <h2 class="text-xl sm:text-2xl font-black text-red-600">₱{{ (unpaidThisMonth || 0).toFixed(2) }}</h2>
          <p class="text-xs text-red-500 mt-1 flex items-center gap-1"><Ban :size="12" /> Not yet collected</p>
        </div>

        <!-- This Year Unpaid -->
        <div class="bg-red-50 rounded-3xl border border-red-200 p-4 sm:p-6">
          <p class="text-red-600 text-xs sm:text-sm mb-2 flex items-center gap-2">
            <Clock :size="14" /> This Year (Pending)
          </p>
          <h2 class="text-xl sm:text-2xl font-black text-red-600">₱{{ (unpaidThisYear || 0).toFixed(2) }}</h2>
          <p class="text-xs text-red-500 mt-1 flex items-center gap-1"><Ban :size="12" /> Not yet collected</p>
        </div>
      </div>
    </div>
  </div>
</template>