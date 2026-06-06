<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">

      <div class="px-6 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
        <h3 class="text-lg font-bold text-slate-800">Edit Transaction</h3>
        <p class="text-sm text-slate-500 mt-1">Update transaction details</p>
      </div>

      <div class="px-6 py-4 space-y-4">

        <!-- Gallon Type — dynamic from DB -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Gallon Type</label>
          <select v-model="form.gallon_type" class="w-full px-3 py-2 text-gray-600 border border-slate-300 rounded-xl text-sm">
            <option v-if="gallonTypes.length === 0" value="">Loading...</option>
            <option v-for="g in gallonTypes" :key="g.id" :value="g.name" class="text-gray-600">{{ g.name }}</option>
          </select>
        </div>

        <!-- Transaction Type -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
          <select v-model="form.transaction_type" class="w-full px-3 py-2 border text-gray-600 border-slate-300 rounded-xl text-sm">
            <option value="regular" class="text-gray-600">Regular</option>
            <option value="reseller"class="text-gray-600" >Reseller</option>
          </select>
        </div>

        <!-- Quantity -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
          <input type="number" v-model.number="form.quantity" min="1"
            class="w-full px-3 py-2 border text-gray-600 border-slate-300 rounded-xl text-sm" />
        </div>

        <!-- Price per piece -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Price per Piece (₱)</label>
          <input type="number" v-model.number="form.price_per_piece" min="0" step="0.01"
            class="w-full px-3 py-2 border text-gray-600 border-slate-300 rounded-xl text-sm" />
        </div>

        <!-- Total — readonly, auto-calculated -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Total Amount (₱)</label>
          <input type="number" :value="computedTotal" readonly
            class="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm text-gray-600" />
          <p class="text-xs text-gray-600 mt-1">Auto-calculated from quantity × price</p>
        </div>

        <!-- Reseller fields -->
        <div v-if="form.transaction_type === 'reseller'" class="space-y-3 border-t border-slate-100 pt-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Reseller Quantity</label>
            <input type="number" v-model.number="form.reseller_qty" min="0"
              class="w-full px-3 py-2 border text-gray-600 border-slate-300 rounded-xl text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Reseller Price</label>
            <input type="number" v-model.number="form.reseller_price" min="0" step="0.01"
              class="w-full px-3 py-2 text-gray-600 border border-slate-300 rounded-xl text-sm" />
          </div>
        </div>

        <!-- Rider -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Assign Rider</label>
          <select v-model="form.rider_id" class="w-full px-3 py-2 border text-gray-600 border-slate-300 rounded-xl text-sm">
            <option :value="null">Unassigned</option>
            <option v-for="rider in riders" :key="rider.id" :value="rider.id" class="text-gray-600">{{ rider.name }}</option>
          </select>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select v-model="form.status" class="w-full px-3 py-2 text-gray-600 border border-slate-300 rounded-xl text-sm">
            <option value="pending" class="text-gray-600">Pending</option>
            <option value="completed" class="text-gray-600">Completed</option>
            <option value="cancelled" class="text-gray-600">Cancelled</option>
          </select>
        </div>

        <div v-if="saveError" class="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {{ saveError }}
        </div>
      </div>

      <div class="px-6 py-5 flex gap-3 border-t border-slate-100 sticky bottom-0 bg-white">
        <button @click="save" :disabled="saving"
          class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 text-sm">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button @click="$emit('close')"
          class="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-2.5 rounded-xl transition text-sm">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'

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

type Rider = { id: string; name: string }
type GallonType = { id: string; name: string }

const props = defineProps<{
  isOpen: boolean
  transaction: Transaction | null
  riders: Rider[]
}>()

const emit = defineEmits<{
  close: []
  saved: [tx: Transaction]
}>()

const supabase = useSupabaseClient() as any
const user = useSupabaseUser()
const saving = ref(false)
const saveError = ref('')
const gallonTypes = ref<GallonType[]>([])

const form = reactive({
  gallon_type: '',
  transaction_type: 'regular',
  quantity: 1,
  price_per_piece: 0,
  reseller_qty: null as number | null,
  reseller_price: null as number | null,
  rider_id: null as string | null,
  status: 'completed',
})

// Auto-calculate total
const computedTotal = computed(() =>
  (form.quantity || 0) * (form.price_per_piece || 0)
)

// Populate form when transaction changes
watch(
  () => props.transaction,
  (tx) => {
    if (!tx) return
    form.gallon_type      = tx.gallon_type
    form.transaction_type = tx.transaction_type
    form.quantity         = tx.quantity
    form.price_per_piece  = tx.price_per_piece
    form.reseller_qty     = tx.reseller_qty
    form.reseller_price   = tx.reseller_price
    form.rider_id         = tx.rider_id
    form.status           = tx.status
  },
  { immediate: true }
)

// Fetch user's actual gallon types
const fetchGallonTypes = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const userId = user.value?.id ?? session?.user?.id
  if (!userId) return

  const { data } = await supabase
    .from('gallon_types')
    .select('id, name')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (data) gallonTypes.value = data
}

const save = async () => {
  if (!props.transaction) return
  saving.value = true
  saveError.value = ''

  try {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = user.value?.id ?? session?.user?.id
    if (!userId) throw new Error('Not authenticated')

    // Resolve rider_name from selected rider_id
    const selectedRider = props.riders.find(r => r.id === form.rider_id)
    const riderName = selectedRider?.name ?? null

    const updateData = {
      gallon_type:      form.gallon_type,
      transaction_type: form.transaction_type,
      quantity:         form.quantity,
      price_per_piece:  form.price_per_piece,
      total_amount:     computedTotal.value,
      reseller_qty:     form.transaction_type === 'reseller' ? form.reseller_qty : null,
      reseller_price:   form.transaction_type === 'reseller' ? form.reseller_price : null,
      rider_id:         form.rider_id,
      rider_name:       riderName,    // ← FIXED: include rider_name
      status:           form.status,
    }

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', props.transaction.id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)

    // ← FIXED: emit complete updated object so UI reflects immediately
    emit('saved', {
      ...props.transaction,
      ...updateData,
    } as Transaction)

  } catch (err: any) {
    saveError.value = err.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}

onMounted(() => fetchGallonTypes())
</script>