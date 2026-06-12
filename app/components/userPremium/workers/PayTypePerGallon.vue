<script lang="ts" setup>
import { PaintBucket } from '@lucide/vue'
defineProps<{
  modelValue: number | null
}>()

defineEmits<{
  'update:modelValue': [value: number | null]
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 flex items-start gap-3">
      <span class="text-xl">
        <PaintBucket class="text-cyan-600"/>
      </span>
      <div>
        <p class="text-sm font-bold text-cyan-800">Per Gallon Rate</p>
        <p class="text-xs text-cyan-600 mt-0.5">Worker is paid based on total gallons delivered. No base daily rate — earnings depend on delivery volume.</p>
      </div>
    </div>

    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-2">
        Rate per Gallon <span class="text-red-400">*</span>
      </label>
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
        <input
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).valueAsNumber || null)"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="e.g. 5.00"
          class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
        />
      </div>
      <p class="text-xs text-slate-400 mt-1.5">Amount earned per gallon delivered (e.g. ₱5/gallon)</p>
    </div>
  </div>
</template>