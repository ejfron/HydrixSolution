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
  transaction_type: string
  created_at: string
}[]>([])

const loading = ref(true)
// use string for v-model of <input type="date"> which yields YYYY-MM-DD strings
const selectedDate = ref<string | null>(null)

const fetchTransactions = async () => {
  loading.value = true

  const { data: { session } } = await client.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id

  if (!userId) {
    loading.value = false
    return
  }

  let query = client
    .from('transactions')
    .select('*')
    .eq('user_id', userId)

  //  DATE FILTER LOGIC
  if (selectedDate.value) {
    const start = `${selectedDate.value}T00:00:00`
    const end = `${selectedDate.value}T23:59:59`

    query = query
      .gte('created_at', start)
      .lte('created_at', end)
  }

  const { data } = await query.order('created_at', {
    ascending: false
  })

  transactions.value = data || []
  loading.value = false
}

const statusColor = (status: string) => {
  if (status === 'completed') return 'bg-green-100 text-green-700'
  if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

const typeLabel = (type: string) => {
  if (type === 'reseller') return 'Retailer/Reseller'
  return 'Regular'
}

const typeBadgeColor = (type: string) => {
  if (type === 'reseller') return 'bg-violet-100 text-violet-700'
  return 'bg-green-100 text-green-700'
}

const formatDate = (d: string) =>
  new Date(d).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

watch(selectedDate, () => {
  fetchTransactions()
})

onMounted(() => fetchTransactions())
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <div class="p-4 sm:p-6 lg:p-8 space-y-6">

        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Transactions</h2>
            <p class="text-slate-500 text-xs sm:text-sm mt-1">All your dispensing transactions</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

            
          <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input
              v-model="selectedDate"
              type="date"
              class="px-4 py-3 text-gray-700 border border-green-600 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button
              v-if="selectedDate"
              @click="selectedDate = null"
              class="px-4 py-3 border border-red-200 text-red-600 rounded-2xl text-sm font-semibold hover:bg-red-50"
            >
              Clear Filter
            </button>
          </div>

          <button
            @click="fetchTransactions"
            class="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-green-600 text-green-600 hover:bg-green-50 font-semibold text-xs sm:text-sm transition cursor-pointer"
          >
            <RefreshCw :size="16" />
            Refresh
          </button>


          </div>

        </div>

        <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden">

          <!-- Loading state -->
          <div v-if="loading" class="p-10 text-center text-slate-400 text-sm">
            Loading transactions...
          </div>

          <!-- Empty state -->
          <div v-else-if="transactions.length === 0" class="p-10 text-center text-slate-400 text-sm">
            No transactions yet. Go to Dispense to get started!
          </div>

          <!-- Has transactions: table on lg+, cards on smaller -->
          <template v-else>
            <!-- Desktop Table (hidden on mobile) -->
            <div class="hidden lg:block">
              <table class="w-full">
                <thead class="bg-slate-50">
                  <tr class="text-gray-600 text-xs">
                    <th class="text-left px-6 py-5">Date & Time</th>
                    <th class="text-left px-6 py-5">Type</th>
                    <th class="text-left px-6 py-5">Gallon Type</th>
                    <th class="text-left px-6 py-5">Qty</th>
                    <th class="text-left px-6 py-5">Price/pc</th>
                    <th class="text-left px-6 py-5">Total</th>
                    <th class="text-left px-6 py-5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="t in transactions"
                    :key="t.id"
                    class="border-b border-slate-100 text-gray-700 text-xs hover:bg-slate-50 transition"
                  >
                    <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(t.created_at) }}</td>
                    <td class="px-6 py-4">
                      <span :class="['px-2 py-1 rounded-full text-xs font-semibold', typeBadgeColor(t.transaction_type)]">
                        {{ typeLabel(t.transaction_type) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 font-semibold">{{ t.gallon_type }}</td>
                    <td class="px-6 py-4">{{ t.quantity }} pcs</td>
                    <td class="px-6 py-4">₱{{ Number(t.price_per_piece).toFixed(2) }}</td>
                    <td class="px-6 py-4 font-bold text-green-600">₱{{ Number(t.total_amount).toFixed(2) }}</td>
                    <td class="px-6 py-4">
                      <span :class="['px-2 py-1 rounded-full text-xs font-semibold', statusColor(t.status)]">
                        {{ t.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Cards (visible only below lg) -->
            <div class="lg:hidden divide-y divide-slate-100">
              <div
                v-for="t in transactions"
                :key="t.id"
                class="p-4 sm:p-5 space-y-3"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs text-slate-400">{{ formatDate(t.created_at) }}</span>
                  <span :class="['px-2 py-1 rounded-full text-xs font-semibold', statusColor(t.status)]">
                    {{ t.status }}
                  </span>
                </div>

                <div class="flex items-start gap-3">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-sm text-gray-800 truncate">{{ t.gallon_type }}</h3>
                    <div class="flex items-center gap-2 mt-1">
                      <span :class="['px-2 py-0.5 rounded-full text-[11px] font-semibold', typeBadgeColor(t.transaction_type)]">
                        {{ typeLabel(t.transaction_type) }}
                      </span>
                      <span class="text-xs text-slate-400">{{ t.quantity }} pcs</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-slate-400">Price/pc</p>
                    <p class="text-sm font-semibold text-gray-700">₱{{ Number(t.price_per_piece).toFixed(2) }}</p>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span class="text-xs font-semibold text-slate-500">Total</span>
                  <span class="font-bold text-green-600 text-sm">₱{{ Number(t.total_amount).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>

      </div>
    </main>
  </div>
</template>