<script lang="ts" setup>

import { Lightbulb } from '@lucide/vue'
defineProps<{
  dailyRate: number | null
  galllonPercent: number | null
  galllonRate: number | null
}>()

defineEmits<{
  'update:dailyRate': [value: number | null]
  'update:galllonPercent': [value: number | null]
  'update:galllonRate': [value: number | null]
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex items-start gap-3">
      <span class="text-xl">
        <Lightbulb class="text-violet-600"/>
      </span>
      <div>
        <p class="text-sm font-bold text-violet-800">Fixed + Gallon Bonus</p>
        <p class="text-xs text-violet-600 mt-0.5">Worker gets a guaranteed daily rate <strong>plus</strong> a per-gallon bonus for every gallon delivered. Great for incentivizing delivery volume.</p>
      </div>
    </div>

    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-2">
        Base Daily Rate <span class="text-red-400">*</span>
      </label>
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
        <input
          :value="dailyRate"
          @input="$emit('update:dailyRate', ($event.target as HTMLInputElement).valueAsNumber || null)"
          type="number"
          min="1"
          placeholder="e.g. 400"
          class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
        />
      </div>
      <p class="text-xs text-slate-400 mt-1.5">Guaranteed base pay per day worked</p>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          Per-Gallon Bonus <span class="text-red-400">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
          <input
            :value="galllonRate"
            @input="$emit('update:galllonRate', ($event.target as HTMLInputElement).valueAsNumber || null)"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 3.00"
            class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          />
        </div>
        <p class="text-xs text-slate-400 mt-1">₱ per gallon delivered</p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          % of Gallon Sales <span class="text-red-400">*</span>
        </label>
        <div class="relative">
          <input
            :value="galllonPercent"
            @input="$emit('update:galllonPercent', ($event.target as HTMLInputElement).valueAsNumber || null)"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="e.g. 5"
            class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
        </div>
        <p class="text-xs text-slate-400 mt-1">% of gallon revenue</p>
      </div>
    </div>

    <div class="bg-violet-50 rounded-xl p-3 border border-violet-100">
      <p class="text-xs text-violet-700 font-semibold">💡 How it works:</p>
      <p class="text-xs text-violet-600 mt-1">
        Daily pay = Base rate + (Gallons delivered × ₱/gallon bonus) + (Gallon revenue × %)
      </p>
    </div>
  </div>
</template>