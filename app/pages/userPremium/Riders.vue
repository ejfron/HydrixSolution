<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { useSupabaseClient } from '#imports'
import { Plus, X, Trash2, User, Phone, CheckCircle, Bike } from '@lucide/vue'
import Navbar from '~/components/userPremium/Navbar.vue'
import Sidebar from '~/components/userPremium/Sidebar.vue'

const client = useSupabaseClient()
const user = useSupabaseUser()

type Rider = {
  id: string
  name: string
  phone: string | null
  is_active: boolean
  created_at: string
}

const riders = ref<Rider[]>([])
const loading = ref(true)
const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')
const successMsg = ref('')

const newName = ref('')
const newPhone = ref('')

const showDeleteModal = ref(false)
const deletingId = ref<string | null>(null)
const deletingName = ref('')
const deleting = ref(false)

const getUserId = async () => {
  const { data: { session } } = await client.auth.getSession()
  return user.value?.id ?? session?.user?.id
}

const fetchRiders = async () => {
  loading.value = true
  const userId = await getUserId()
  if (!userId) return

  const { data } = await (client.from('delivery_riders') as any)
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (data) riders.value = data
  loading.value = false
}

const createRider = async () => {
  if (!newName.value.trim()) {
    createError.value = 'Please enter rider name.'
    return
  }

  const userId = await getUserId()
  if (!userId) return

  creating.value = true
  createError.value = ''

  const { error } = await (client.from('delivery_riders') as any).insert({
    user_id: userId,
    name: newName.value.trim(),
    phone: newPhone.value.trim() || null,
  })

  if (error) {
    createError.value = error.message
    creating.value = false
    return
  }

  newName.value = ''
  newPhone.value = ''
  showCreateModal.value = false
  creating.value = false
  await fetchRiders()
  showSuccess('Rider created successfully!')
}

const confirmDelete = (id: string, name: string) => {
  deletingId.value = id
  deletingName.value = name
  showDeleteModal.value = true
}

const deleteRider = async () => {
  if (!deletingId.value) return
  deleting.value = true

  await (client.from('delivery_riders') as any)
    .update({ is_active: false })
    .eq('id', deletingId.value)

  riders.value = riders.value.filter(r => r.id !== deletingId.value)
  showDeleteModal.value = false
  deletingId.value = null
  deletingName.value = ''
  deleting.value = false
  showSuccess('Rider removed.')
}

const showSuccess = (msg: string) => {
  successMsg.value = msg
  setTimeout(() => successMsg.value = '', 3000)
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

onMounted(() => fetchRiders())
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb] flex">
    <Sidebar />
    <main class="flex-1 min-w-0">
      <Navbar />

      <!-- Create Rider Modal -->
      <Transition name="fade">
        <div v-if="showCreateModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <Transition name="scale">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div class="bg-green-600 px-6 py-5 flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-black text-white">Add Delivery Rider</h2>
                  <p class="text-green-100 text-xs mt-0.5">Register a new rider</p>
                </div>
                <button @click="showCreateModal = false; createError = ''" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition">
                  <X :size="16" class="text-white" />
                </button>
              </div>

              <div class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Rider Name <span class="text-red-400">*</span>
                  </label>
                  <div class="relative">
                    <User :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      v-model="newName"
                      type="text"
                      placeholder="e.g. Juan Dela Cruz"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number (optional)</label>
                  <div class="relative">
                    <Phone :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      v-model="newPhone"
                      type="text"
                      placeholder="e.g. 09171234567"
                      class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                  </div>
                </div>

                <div v-if="createError" class="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                  {{ createError }}
                </div>

                <div class="flex gap-3 pt-2">
                  <button @click="createRider" :disabled="creating"
                    class="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-2xl font-bold text-sm transition cursor-pointer">
                    {{ creating ? 'Saving...' : 'Save Rider' }}
                  </button>
                  <button @click="showCreateModal = false; createError = ''"
                    class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </Transition>
          <div class="absolute inset-0 -z-10" @click="showCreateModal = false; createError = ''" />
        </div>
      </Transition>

      <!-- Delete Modal -->
      <Transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <Transition name="scale">
            <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
              <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 :size="24" class="text-red-500" />
              </div>
              <h2 class="text-lg font-black text-gray-800 mb-2">Remove Rider</h2>
              <p class="text-sm text-slate-500 mb-6">
                Remove <span class="font-bold text-gray-700">{{ deletingName }}</span>?
                Their transaction history will be kept.
              </p>
              <div class="flex gap-3">
                <button @click="deleteRider" :disabled="deleting"
                  class="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm transition cursor-pointer">
                  {{ deleting ? 'Removing...' : 'Yes, Remove' }}
                </button>
                <button @click="showDeleteModal = false"
                  class="flex-1 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          </Transition>
          <div class="absolute inset-0 -z-10" @click="showDeleteModal = false" />
        </div>
      </Transition>

      <!-- Main Content -->
      <div class="p-4 sm:p-8 space-y-6">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-700">Delivery Riders</h2>
            <p class="text-slate-500 text-xs sm:text-sm mt-1">Manage your delivery team</p>
          </div>
          <button @click="showCreateModal = true"
            class="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm transition cursor-pointer">
            <Plus :size="16" />
            Add Rider
          </button>
        </div>

        <!-- Success -->
        <Transition name="fade">
          <div v-if="successMsg" class="px-5 py-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-semibold flex items-center gap-2">
            <CheckCircle :size="16" />
            {{ successMsg }}
          </div>
        </Transition>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-16 text-slate-400 text-sm">
          Loading riders...
        </div>

        <!-- Empty -->
        <div v-else-if="riders.length === 0"
          class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <div class="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Bike :size="28" class="text-green-600" />
          </div>
          <h3 class="font-bold text-slate-700 text-lg mb-2">No riders yet</h3>
          <p class="text-slate-400 text-sm mb-6">Add your first delivery rider to start tracking deliveries</p>
          <button @click="showCreateModal = true"
            class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm transition cursor-pointer">
            Add First Rider
          </button>
        </div>

        <!-- Riders Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="rider in riders"
            :key="rider.id"
            class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div class="absolute top-0 left-0 w-full h-0.5 bg-green-600 rounded-t-3xl" />

            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-black text-xl shrink-0">
                  {{ rider.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-bold text-slate-800">{{ rider.name }}</h3>
                  <p v-if="rider.phone" class="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone :size="10" /> {{ rider.phone }}
                  </p>
                  <p v-else class="text-xs text-slate-300 mt-0.5">No phone</p>
                </div>
              </div>
              <button @click="confirmDelete(rider.id, rider.name)"
                class="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition cursor-pointer shrink-0">
                <Trash2 :size="15" />
              </button>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span class="text-xs text-slate-400">Added {{ formatDate(rider.created_at) }}</span>
              <span class="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-[11px] font-semibold">Active</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active, .scale-leave-active { transition: all 0.2s ease; }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.95); }
</style>