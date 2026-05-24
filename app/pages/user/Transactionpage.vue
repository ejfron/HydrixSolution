<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient } from '#imports'
import { RefreshCw } from '@lucide/vue'
import Navbar from '~/components/user/Navbar.vue'
import Sidebar from '~/components/user/Sidebar.vue'

const client = useSupabaseClient()
const user = useSupabaseUser()

const transactions = ref<{
  id: string
  gallon_type: string
  quantity: number
  price_per_piece: number
  total_amount: number
  status: string
  created_at: string
}[]>([])

const loading = ref(true)

const fetchTransactions = async () => {
  loading.value = true

  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id

  if (!userId) {
    loading.value = false
    return
  }

  const { data } = await client
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (data) transactions.value = data
  loading.value = false
}

const statusColor = (status: string) => {
  if (status === 'completed') return 'bg-green-100 text-green-700'
  if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

const formatDate = (d: string) =>
  new Date(d).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

onMounted(() => fetchTransactions())
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <div class="p-8 space-y-6">

        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-700">Transactions</h2>
            <p class="text-slate-500 text-sm mt-1">All your dispensing transactions</p>
          </div>

          <button
            @click="fetchTransactions"
            class="flex items-center gap-2 px-5 py-3 rounded-2xl border border-green-600 text-green-600 hover:bg-green-50 font-semibold text-sm transition cursor-pointer"
          >
            <RefreshCw :size="16" />
            Refresh
          </button>
        </div>

        <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden">

          <div v-if="loading" class="p-10 text-center text-slate-400 text-sm">
            Loading transactions...
          </div>

          <div v-else-if="transactions.length === 0" class="p-10 text-center text-slate-400 text-sm">
            No transactions yet. Go to Dispense to get started!
          </div>

          <table v-else class="w-full">
            <thead class="bg-slate-50">
              <tr class="text-gray-600 text-xs">
                <th class="text-left px-8 py-5">Date & Time</th>
                <th class="text-left px-8 py-5">Gallon Type</th>
                <th class="text-left px-8 py-5">Quantity</th>
                <th class="text-left px-8 py-5">Price/piece</th>
                <th class="text-left px-8 py-5">Total</th>
                <th class="text-left px-8 py-5">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="t in transactions"
                :key="t.id"
                class="border-b border-slate-100 text-gray-700 text-xs hover:bg-slate-50 transition"
              >
                <td class="px-8 py-5">{{ formatDate(t.created_at) }}</td>
                <td class="px-8 py-5 font-semibold">{{ t.gallon_type }}</td>
                <td class="px-8 py-5">{{ t.quantity }} pcs</td>
                <td class="px-8 py-5">₱{{ Number(t.price_per_piece).toFixed(2) }}</td>
                <td class="px-8 py-5 font-bold text-green-600">₱{{ Number(t.total_amount).toFixed(2) }}</td>
                <td class="px-8 py-5">
                  <span :class="['px-3 py-1 rounded-full text-xs font-semibold', statusColor(t.status)]">
                    {{ t.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </main>
  </div>
</template>