<script lang="ts" setup>

import { CalendarDays } from '@lucide/vue'
defineProps<{
  modelValue: number | null
}>()

defineEmits<{
  'update:modelValue': [value: number | null]
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
      <span class="text-xl">
        <CalendarDays class="text-blue-600"/>
      </span>
      <div>
        <p class="text-sm font-bold text-blue-800">Fixed Daily Rate</p>
        <p class="text-xs text-blue-600 mt-0.5">Worker is paid a fixed amount per day worked, regardless of gallons delivered.</p>
      </div>
    </div>

    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-2">
        Daily Rate <span class="text-red-400">*</span>
      </label>
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
 <input
  :value="modelValue"
  @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
  type="number"
  min="1"
  placeholder="e.g. 550"
  class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
/>
      </div>
      <p class="text-xs text-slate-400 mt-1.5">Amount paid per full day of work</p>
    </div>
  </div>
</template>