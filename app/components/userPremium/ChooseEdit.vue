<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
    <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full transform transition-all">
      <!-- Header -->
      <div class="px-6 pt-5 pb-3 border-b border-slate-100">
        <h3 class="text-lg font-bold text-slate-800">Choose action</h3>
        <p class="text-sm text-slate-500 mt-1">What would you like to do with this transaction?</p>
      </div>

      <!-- Body with transaction summary -->
      <div class="px-6 py-4 bg-slate-50/50">
        <div class="text-sm text-slate-600 space-y-1">
          <div class="flex justify-between">
            <span class="font-medium">Gallon Type:</span>
            <span>{{ transaction?.gallon_type }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">Amount:</span>
            <span class="font-semibold text-green-600">{{ formatPeso(transaction?.total_amount || 0) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">Date:</span>
            <span>{{ formatDate(transaction?.created_at || '') }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-6 py-5 flex flex-col sm:flex-row gap-3">
        <button
          @click="onEdit"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-sm"
        >
          <Pencil :size="18" />
          Edit Transaction
        </button>
        <button
          @click="onDelete"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition shadow-sm"
        >
          <Trash2 :size="18" />
          Delete Transaction
        </button>
      </div>

      <!-- Cancel link -->
      <div class="px-6 pb-5 text-center">
        <button @click="close" class="text-sm text-slate-400 hover:text-slate-600 transition">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'

type Transaction = {
  id: string
  gallon_type: string
  quantity: number
  price_per_piece: number
  total_amount: number
  status: string
  transaction_type: string
  reseller_qty: number | null
  reseller_price: number | null
  rider_id: string | null
  rider_name: string | null
  created_at: string
}

const props = defineProps<{
  isOpen: boolean
  transaction: Transaction | null
}>()

const emit = defineEmits<{
  close: []
  edit: [transaction: Transaction]
  delete: [id: string]
}>()

const close = () => emit('close')
const onEdit = () => {
  if (props.transaction) emit('edit', props.transaction)
  close()
}
const onDelete = () => {
  if (props.transaction) emit('delete', props.transaction.id)
  close()
}

const formatPeso = (n: number) =>
  `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
</script>